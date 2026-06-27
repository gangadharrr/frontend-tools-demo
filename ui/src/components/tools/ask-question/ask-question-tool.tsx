import { useTool } from '../../../hooks/useTool';
import type { AskUserQuestionInput, AskUserQuestionResult, Question } from './types';
import { InteractiveQuestionUI } from './interactive-question-ui';
import { CompletedAnswersUI, CancelledHeader, RejectedAnswersUI } from './completed-answers-ui';
import { PreparingQuestionsUI } from './preparing-questions-ui';
import { formatResponseMessage, parseQuestions } from './utils';
import { AskToolDisplayMessages } from './constants';

const schema: Record<string, unknown> = {
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      description: 'Array of questions to ask the user',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'The question text to ask the user' },
          header: { type: 'string', description: 'A brief header/title for the question' },
          options: {
            type: 'array',
            description: 'Array of predefined options for the user to choose from',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', description: 'The option label' },
                description: { type: 'string', description: 'Description of the option' },
              },
              required: ['label', 'description'],
            },
            minItems: 1,
          },
          multiSelect: {
            type: 'boolean',
            description:
              'Whether the user can select multiple options (true) or just one (false)',
          },
        },
        required: ['question', 'header', 'options', 'multiSelect'],
      },
      minItems: 1,
    },
  },
  required: ['questions'],
};

/**
 * The `ask_user_question` tool — registers three render modes against the
 * shared tool lifecycle:
 *   - streaming        → PreparingQuestionsUI (skeletons while args stream in)
 *   - waitingForInput  → InteractiveQuestionUI (handles both single- and multi-question)
 *   - responded        → CompletedAnswersUI (final Q&A or cancelled header)
 */
export function AskQuestionTool() {
  useTool<AskUserQuestionInput, AskUserQuestionResult>({
    name: 'ask_user_question',
    description: `Ask the user one or more questions with predefined options. Use this when you need user input to make decisions or gather information.

Each question supports:
- Single-select mode (radio buttons) or multi-select mode (checkboxes)
- Predefined options with labels and descriptions
- Optional "Other" option with custom text input (automatically included)

Best Practices:
- Provide clear, concise question text
- Include descriptive headers to give context
- Offer meaningful options that cover common scenarios
- Use multiSelect=true when multiple answers are valid
- Use multiSelect=false when only one answer should be selected
- For multi-question asks, batch related questions together so the user can move through them with Previous/Next/Skip/Submit`,
    schema,
    render: {
      // 1. STREAMING — args are arriving. Skeleton placeholders.
      streaming: ({ args, argsRaw }) => (
        <PreparingQuestionsUI args={args} argsRaw={argsRaw} />
      ),

      // 2. WAITING FOR INPUT — full args received. Show interactive form.
      waitingForInput: ({ args, onSubmit }) => {
        const questions = resolveQuestions(args);
        if (!questions) {
          return (
            <div className="p-2 text-xs" style={{ color: 'var(--error-text)' }}>
              No questions found in args
            </div>
          );
        }
        return (
          <InteractiveQuestionUI
            questions={questions}
            onSubmit={(answers) =>
              onSubmit({
                success: true,
                answers,
                cancelled: false,
              })
            }
            onCancel={() =>
              onSubmit({
                success: false,
                answers: {},
                cancelled: true,
                feedback: AskToolDisplayMessages.USER_CANCELLED,
              })
            }
          />
        );
      },

      // 3. RESPONDED — final state. Q&A (or cancelled) shown.
      responded: ({ args, result, outcome }) => {
        if (outcome === 'cancelled') {
          return <CancelledHeader />;
        }
        const questions = resolveQuestions(args) ?? [];
        if (questions.length === 0) return null;
        return (
          <CompletedAnswersUI
            questions={questions}
            result={result}
            outcome={outcome}
          />
        );
      },

      // 4. REJECTED — user replied in chat while the question form was pending;
      //    the question is superseded by the new message. Show a compact
      //    "rejected" header together with the questions that were asked so
      //    the user has context about what was bypassed.
      rejected: ({ args }) => {
        const questions = resolveQuestions(args) ?? [];
        return <RejectedAnswersUI questions={questions} />;
      },
    },
    handle: (_args, result) => {
      if (result.cancelled) {
        return {
          externalToolResponse: 'failure',
          failureMessage: AskToolDisplayMessages.USER_CANCELLED,
        };
      }
      // Build a human-readable summary for the agent.
      const questions = resolveQuestions(_args) ?? [];
      const summary = questions.length
        ? formatResponseMessage(questions, result.answers)
        : JSON.stringify(result.answers);
      return {
        externalToolResponse: 'success',
        successMessage: summary,
      };
    },
  });

  return null;
}

function resolveQuestions(args: AskUserQuestionInput | undefined): Question[] | null {
  if (!args) return null;
  return parseQuestions(args.questions) ?? parseQuestions(args as never);
}
