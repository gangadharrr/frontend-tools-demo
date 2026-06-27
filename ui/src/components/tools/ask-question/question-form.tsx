import { X, Loader2 } from 'lucide-react';
import { Button } from '../../Button';
import type { Question, QuestionFormState } from './types';
import {
  CANCELLING_TEXT,
  OTHER_OPTION_DESCRIPTION,
  OTHER_OPTION_LABEL,
} from './constants';
import { OptionCard } from './option-card';
import { CustomAnswerInput } from './custom-answer-input';

interface QuestionFormProps {
  question: Question;
  questionIndex: number;
  formState: QuestionFormState;
  onFormStateChange: (
    updater: (prev: QuestionFormState) => QuestionFormState,
  ) => void;
  /** Auto-submit handler for single-select picks (single-question flow). */
  onSingleSelectAnswer?: (answer: string) => void;
  /** Enter-key handler inside the "Other" custom input. */
  onCustomAnswerSubmit?: () => void;
  /** Top-right dismiss (X) — cancels the entire form. */
  onDismiss?: () => void;
  /** Per-question Skip — only mounted in multi-question flow. */
  onSkip?: () => void;
  isCancelling?: boolean;
  isSubmitting?: boolean;
}

const OPTIONS_CONTAINER_CLASS =
  'max-h-64 overflow-y-auto overflow-x-hidden custom-scrollbar';

/**
 * Renders ONE question with its options.
 *
 * State is owned by the parent (`InteractiveQuestionUI`) via `QuestionFormState`,
 * so this component is purely presentational + intent-emitting.
 */
export function QuestionForm({
  question,
  questionIndex,
  formState,
  onFormStateChange,
  onSingleSelectAnswer,
  onCustomAnswerSubmit,
  onDismiss,
  onSkip,
  isCancelling = false,
  isSubmitting = false,
}: QuestionFormProps) {
  const { selectedAnswers, customInputs, otherSelected } = formState;

  const handleCheckboxToggle = (optionLabel: string, isChecked: boolean) => {
    onFormStateChange(prev => {
      const current = prev.selectedAnswers[questionIndex] || [];
      const updated = isChecked
        ? [...current, optionLabel]
        : current.filter(label => label !== optionLabel);
      return {
        ...prev,
        selectedAnswers: { ...prev.selectedAnswers, [questionIndex]: updated },
      };
    });
  };

  const handleRadioChange = (value: string) => {
    if (value === 'other') {
      onFormStateChange(prev => ({
        ...prev,
        otherSelected: { ...prev.otherSelected, [questionIndex]: true },
        selectedAnswers: { ...prev.selectedAnswers, [questionIndex]: [] },
      }));
      setTimeout(() => {
        document.getElementById(`custom-${questionIndex}`)?.focus();
      }, 0);
    } else {
      onFormStateChange(prev => ({
        ...prev,
        otherSelected: { ...prev.otherSelected, [questionIndex]: false },
        selectedAnswers: { ...prev.selectedAnswers, [questionIndex]: [value] },
      }));
      onSingleSelectAnswer?.(value);
    }
  };

  const handleOtherCheckboxToggle = () => {
    const newOtherSelected = !otherSelected[questionIndex];
    onFormStateChange(prev => ({
      ...prev,
      otherSelected: { ...prev.otherSelected, [questionIndex]: newOtherSelected },
    }));
    if (newOtherSelected) {
      setTimeout(() => {
        document.getElementById(`custom-${questionIndex}`)?.focus();
      }, 0);
    }
  };

  const handleCustomInputChange = (value: string) => {
    onFormStateChange(prev => ({
      ...prev,
      customInputs: { ...prev.customInputs, [questionIndex]: value },
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3 px-1 pt-1">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            {question.header}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
            {question.question}
          </p>
        </div>
        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Dismiss questions"
            title="Dismiss questions"
            disabled={isCancelling || isSubmitting}
            onClick={onDismiss}
            className="h-7 w-7 shrink-0"
          >
            {isCancelling ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-sm" style={{ borderTop: '1px solid var(--tool-border)' }}>
        <div className={OPTIONS_CONTAINER_CLASS}>
          {question.multiSelect ? (
            <div className="divide-y" style={{ borderColor: 'var(--tool-border)' }}>
              {question.options.map((option, optIdx) => {
                const optionId = `q${questionIndex}-opt${optIdx}`;
                const isSelected = (selectedAnswers[questionIndex] || []).includes(option.label);

                return (
                  <OptionCard
                    key={optIdx}
                    id={optionId}
                    isSelected={isSelected}
                    label={option.label}
                    description={option.description}
                    optionIndex={optIdx + 1}
                    isMultiSelect
                    onKeyDown={e => {
                      if (e.key === ' ') {
                        e.preventDefault();
                        handleCheckboxToggle(option.label, !isSelected);
                      }
                    }}
                  >
                    <input
                      id={optionId}
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => handleCheckboxToggle(option.label, e.target.checked)}
                      className="sr-only"
                    />
                  </OptionCard>
                );
              })}

              <OptionCard
                id={`q${questionIndex}-other`}
                isSelected={!!otherSelected[questionIndex]}
                label={OTHER_OPTION_LABEL}
                description={OTHER_OPTION_DESCRIPTION}
                isOther
                isMultiSelect
                inlineContent={
                  otherSelected[questionIndex] ? (
                    <CustomAnswerInput
                      questionIndex={questionIndex}
                      value={customInputs[questionIndex] || ''}
                      onChange={handleCustomInputChange}
                      onSubmit={onCustomAnswerSubmit}
                    />
                  ) : undefined
                }
                endContent={
                  onSkip ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isCancelling || isSubmitting}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        onSkip();
                      }}
                      className="h-8 shrink-0"
                    >
                      {isCancelling ? CANCELLING_TEXT : 'Skip'}
                    </Button>
                  ) : undefined
                }
                onKeyDown={e => {
                  if (e.key === ' ') {
                    e.preventDefault();
                    handleOtherCheckboxToggle();
                  }
                }}
              >
                <input
                  id={`q${questionIndex}-other`}
                  type="checkbox"
                  checked={!!otherSelected[questionIndex]}
                  onChange={handleOtherCheckboxToggle}
                  className="sr-only"
                />
              </OptionCard>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--tool-border)' }}>
              {question.options.map((option, optIdx) => {
                const optionId = `q${questionIndex}-opt${optIdx}`;
                const isSelected = selectedAnswers[questionIndex]?.[0] === option.label;

                return (
                  <OptionCard
                    key={optIdx}
                    id={optionId}
                    isSelected={isSelected}
                    label={option.label}
                    description={option.description}
                    optionIndex={optIdx + 1}
                    onKeyDown={e => {
                      if (e.key === ' ') {
                        e.preventDefault();
                        handleRadioChange(option.label);
                      }
                    }}
                  >
                    <input
                      id={optionId}
                      type="radio"
                      name={`q${questionIndex}`}
                      value={option.label}
                      checked={isSelected}
                      onChange={() => handleRadioChange(option.label)}
                      className="sr-only"
                    />
                  </OptionCard>
                );
              })}

              <OptionCard
                id={`q${questionIndex}-other`}
                isSelected={!!otherSelected[questionIndex]}
                label={OTHER_OPTION_LABEL}
                description={OTHER_OPTION_DESCRIPTION}
                isOther
                inlineContent={
                  otherSelected[questionIndex] ? (
                    <CustomAnswerInput
                      questionIndex={questionIndex}
                      value={customInputs[questionIndex] || ''}
                      onChange={handleCustomInputChange}
                      onSubmit={onCustomAnswerSubmit}
                    />
                  ) : undefined
                }
                endContent={
                  onSkip ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isCancelling || isSubmitting}
                      onClick={event => {
                        event.preventDefault();
                        event.stopPropagation();
                        onSkip();
                      }}
                      className="h-8 shrink-0"
                    >
                      {isCancelling ? CANCELLING_TEXT : 'Skip'}
                    </Button>
                  ) : undefined
                }
                onKeyDown={e => {
                  if (e.key === ' ') {
                    e.preventDefault();
                    handleRadioChange('other');
                  }
                }}
              >
                <input
                  id={`q${questionIndex}-other`}
                  type="radio"
                  name={`q${questionIndex}`}
                  value="other"
                  checked={!!otherSelected[questionIndex]}
                  onChange={() => handleRadioChange('other')}
                  className="sr-only"
                />
              </OptionCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
