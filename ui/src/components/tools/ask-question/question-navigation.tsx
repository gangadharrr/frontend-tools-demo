import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../../Button';
import { CANCEL_TEXT, CANCELLING_TEXT, SUBMITTING_TEXT } from './constants';

interface QuestionNavigationProps {
  currentQuestion: number;
  totalQuestions: number;
  /** Whether the Next/Submit button is enabled. */
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  showPrevious?: boolean;
  /** Per-question Skip — only meaningful in multi-question flow. */
  onSkip?: () => void;
  isCancelling?: boolean;
  isSubmitting?: boolean;
}

/**
 * Bottom action row for one question: Previous · Skip · Next/Submit.
 * Labels adapt to position (first/last) and to in-flight state.
 */
export function QuestionNavigation({
  currentQuestion,
  totalQuestions,
  canGoNext,
  onPrevious,
  onNext,
  showPrevious = true,
  onSkip,
  isCancelling = false,
  isSubmitting = false,
}: QuestionNavigationProps) {
  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div
      className="flex items-center gap-2 mt-3 pt-3"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {showPrevious && !isFirstQuestion ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPrevious}
          disabled={isCancelling || isSubmitting}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
      ) : (
        <span />
      )}

      <div className="flex-1" />

      {onSkip && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSkip}
          disabled={isCancelling || isSubmitting}
        >
          {isCancelling ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {CANCELLING_TEXT}
            </>
          ) : (
            CANCEL_TEXT
          )}
        </Button>
      )}

      <Button
        type="button"
        size="sm"
        onClick={onNext}
        disabled={!canGoNext || isCancelling || isSubmitting}
      >
        {isLastQuestion ? (
          isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {SUBMITTING_TEXT}
            </>
          ) : (
            <>
              Submit
              <CheckCircle className="size-4" />
            </>
          )
        ) : (
          <>
            Next
            <ChevronRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}
