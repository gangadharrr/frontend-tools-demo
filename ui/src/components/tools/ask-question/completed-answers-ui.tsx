import { CheckCircle2, MinusCircle, AlertCircle, XCircle } from 'lucide-react';
import type { Question, AskUserQuestionResult } from './types';
import { NO_ANSWER_TEXT, QUESTION_KEY_PREFIX } from './constants';

interface CompletedAnswersUIProps {
  questions: Question[];
  result?: AskUserQuestionResult;
  outcome: 'success' | 'cancelled' | 'failure' | 'error';
}

/**
 * Responded-state UI for `ask_user_question`.
 * Renders the final Q&A pairing for every question, with an outcome-aware header.
 */
export function CompletedAnswersUI({ questions, result, outcome }: CompletedAnswersUIProps) {
  if (outcome === 'cancelled') {
    return <CancelledHeader />;
  }

  const answers = result?.answers ?? {};

  return (
    <div className="flex flex-col gap-1.5 py-0.5">
      <OutcomeHeader outcome={outcome} />
      <div className="flex flex-col gap-2 pl-1 pt-0.5">
        {questions.map((question, idx) => {
          const answer = answers[`${QUESTION_KEY_PREFIX}${idx}`] ?? '';
          const isSkipped = !answer || answer === NO_ANSWER_TEXT;

          return (
            <div key={idx} className="flex flex-col gap-0.5 text-sm">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-medium shrink-0" style={{ color: 'var(--muted)' }}>
                  {question.header}
                </span>
                <span className="text-xs opacity-50" style={{ color: 'var(--muted)' }}>·</span>
                <span className="text-xs leading-snug" style={{ color: 'var(--foreground)' }}>
                  {question.question}
                </span>
              </div>
              <div className="pl-3 text-sm" style={{ color: 'var(--foreground)' }}>
                {isSkipped ? (
                  <span className="italic" style={{ color: 'var(--muted)' }}>
                    skipped
                  </span>
                ) : (
                  answer
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OutcomeHeader({ outcome }: { outcome: 'success' | 'cancelled' | 'failure' | 'error' }) {
  if (outcome === 'success') {
    return (
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
        <CheckCircle2 className="size-3 shrink-0" style={{ color: 'var(--success)' }} />
        <span>Answered</span>
      </div>
    );
  }
  if (outcome === 'failure') {
    return (
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
        <AlertCircle className="size-3 shrink-0" style={{ color: 'var(--error-text)' }} />
        <span>Submission failed</span>
      </div>
    );
  }
  if (outcome === 'error') {
    return (
      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
        <XCircle className="size-3 shrink-0" style={{ color: 'var(--error-text)' }} />
        <span>Error</span>
      </div>
    );
  }
  return <CancelledHeader />;
}

function CancelledHeader() {
  return (
    <div className="flex items-center gap-1.5 text-xs py-0.5" style={{ color: 'var(--muted)' }}>
      <MinusCircle className="size-3 shrink-0" />
      <span>Questions skipped</span>
    </div>
  );
}
