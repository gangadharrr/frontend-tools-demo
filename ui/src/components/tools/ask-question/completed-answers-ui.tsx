import { CheckCircle2, MinusCircle, AlertCircle, XCircle } from 'lucide-react';
import type { Question, AskUserQuestionResult } from './types';
import { AskToolDisplayMessages, NO_ANSWER_TEXT, QUESTION_KEY_PREFIX } from './constants';
import { StatusBadge } from '../../ui/status-badge';

interface CompletedAnswersUIProps {
  questions: Question[];
  result?: AskUserQuestionResult;
  outcome: 'success' | 'cancelled' | 'failure' | 'error';
}

type Outcome = 'success' | 'cancelled' | 'failure' | 'error';

const OUTCOME_BADGES: Record<Outcome, { icon: typeof CheckCircle2; label: string; tone: 'success' | 'error' | 'muted' }> = {
  success: { icon: CheckCircle2, label: 'Answered', tone: 'success' },
  cancelled: { icon: MinusCircle, label: 'Questions skipped', tone: 'muted' },
  failure: { icon: AlertCircle, label: 'Submission failed', tone: 'error' },
  error: { icon: XCircle, label: 'Error', tone: 'error' },
};

/**
 * Responded-state UI for `ask_user_question`.
 * Renders the final Q&A pairing for every question, with an outcome-aware header.
 */
export function CompletedAnswersUI({ questions, result, outcome }: CompletedAnswersUIProps) {
  if (outcome === 'cancelled') {
    return <OutcomeBadge outcome="cancelled" />;
  }

  const answers = result?.answers ?? {};

  return (
    <div className="flex flex-col gap-1.5 py-0.5">
      <OutcomeBadge outcome={outcome} />
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

/**
 * Outcome → badge renderer. Single source of truth for the cancelled header
 * (previously a duplicate of `cancelled-answers-ui.tsx`).
 */
function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const { icon, label, tone } = OUTCOME_BADGES[outcome];
  return <StatusBadge icon={icon} tone={tone}>{label}</StatusBadge>;
}

/**
 * Exported so `ask-question-tool.tsx` can render the cancelled UI standalone
 * without re-rendering the entire Q&A list.
 */
export function CancelledHeader() {
  return <OutcomeBadge outcome="cancelled" />;
}

/**
 * Exported so `ask-question-tool.tsx` can render the rejected UI standalone.
 * Shown when the user replied in chat while the question form was still
 * pending — the user chose to redirect the conversation instead of answering.
 */
export function RejectedHeader() {
  return (
    <StatusBadge icon={XCircle} tone="error">
      {AskToolDisplayMessages.TOOL_REJECTED}
    </StatusBadge>
  );
}

/**
 * Full rejected-state UI for `ask_user_question` — shows the "rejected" badge
 * followed by the list of questions that were being asked, so the user has
 * context about what was superseded by their chat reply.
 *
 * Mirrors the layout of `CompletedAnswersUI` (header · question + an "answer"
 * row), but the answer row is always an italic "rejected" placeholder since
 * the user never answered.
 */
export function RejectedAnswersUI({ questions }: { questions: Question[] }) {
  if (questions.length === 0) {
    // Streaming-phase rejection (args never resolved) — fall back to the
    // compact header so the slot still has visible content.
    return <RejectedHeader />;
  }

  return (
    <div className="flex flex-col gap-1.5 py-0.5">
      <RejectedHeader />
      <div className="flex flex-col gap-2 pl-1 pt-0.5">
        {questions.map((question, idx) => (
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
            <div className="pl-3 text-sm italic" style={{ color: 'var(--muted)' }}>
              rejected
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
