export interface QuestionOption {
  label: string;
  description: string;
}

export interface Question {
  question: string;
  header: string;
  options: QuestionOption[];
  multiSelect: boolean;
}

export interface AskUserQuestionInput {
  questions: Question[];
}

/**
 * Result payload sent to the backend when the user submits / cancels.
 * `cancelled` indicates the user dismissed the form entirely.
 * Skipped questions are returned as `"No answer provided"` in `answers`.
 */
export interface AskUserQuestionResult {
  success: boolean;
  answers: Record<string, string>;
  cancelled: boolean;
  feedback?: string;
}

/**
 * Shared form state used across question components.
 * Replaces passing 6 individual state props (DRY).
 */
export interface QuestionFormState {
  selectedAnswers: Record<number, string[]>;
  customInputs: Record<number, string>;
  otherSelected: Record<number, boolean>;
}
