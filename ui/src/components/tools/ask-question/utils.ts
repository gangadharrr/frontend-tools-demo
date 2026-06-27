/**
 * Shared utility functions for the Ask User Question tool.
 * Centralizes state-shape logic used across form components (DRY).
 */

import type { Question, QuestionFormState } from './types';
import { NO_ANSWER_TEXT, QUESTION_KEY_PREFIX } from './constants';

/**
 * Get the answer string for a specific question from form state.
 * Handles both multiSelect and single-select with the "Other" custom input.
 * Used by: interactive-question-ui (submit), completed-answers-ui (display).
 */
export function getAnswerForQuestion(
  question: Question,
  questionIndex: number,
  formState: QuestionFormState,
): string {
  const { selectedAnswers, customInputs, otherSelected } = formState;
  const customValue = customInputs[questionIndex]?.trim() || '';
  const selected = selectedAnswers[questionIndex] || [];

  if (question.multiSelect) {
    const allAnswers = [...selected];
    if (otherSelected[questionIndex] && customValue) {
      allAnswers.push(customValue);
    }
    return allAnswers.join(', ');
  }

  if (otherSelected[questionIndex] && customValue) {
    return customValue;
  }
  return selected.join(', ');
}

/**
 * Whether the user has supplied an answer for a specific question.
 * Used by: interactive-question-ui (canGoNext, progress).
 */
export function isQuestionAnswered(questionIndex: number, formState: QuestionFormState): boolean {
  const { selectedAnswers, customInputs, otherSelected } = formState;
  const hasSelection = (selectedAnswers[questionIndex] || []).length > 0;
  const hasCustomInput =
    otherSelected[questionIndex] && (customInputs[questionIndex]?.trim() || '').length > 0;
  return hasSelection || hasCustomInput;
}

/**
 * Set of indices that have been answered (not skipped).
 * Used by: interactive-question-ui (progress bar, submit gating).
 */
export function getAnsweredQuestionSet(
  questions: Question[],
  formState: QuestionFormState,
): Set<number> {
  const answered = new Set<number>();
  questions.forEach((_, idx) => {
    if (isQuestionAnswered(idx, formState)) answered.add(idx);
  });
  return answered;
}

/**
 * Format answers as a markdown-style message for the agent.
 * Used by: ask-user-question-tool (handleSubmit → builds commandResponse).
 */
export function formatResponseMessage(
  questions: Question[],
  answers: Record<string, string>,
): string {
  const lines = ['The user has provided answers to your questions:', ''];

  questions.forEach((question, idx) => {
    const questionKey = `${QUESTION_KEY_PREFIX}${idx}`;
    const answer = answers[questionKey] || NO_ANSWER_TEXT;
    lines.push(`**${question.header}**: ${answer}`);
  });

  return lines.join('\n');
}

/**
 * Parse a questions array out of partial / streamed args.
 * Tolerant of string-encoded JSON, single-question shapes, etc.
 */
export function parseQuestions(raw: unknown): Question[] | null {
  if (!raw) return null;

  let parsed = raw;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }

  const arr = Array.isArray(parsed) ? parsed : [parsed];
  if (arr.length === 0) return null;
  if (typeof arr[0] !== 'object' || !('question' in (arr[0] as object))) return null;
  return arr as Question[];
}
