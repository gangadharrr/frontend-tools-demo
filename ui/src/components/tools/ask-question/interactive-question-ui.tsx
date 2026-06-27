import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, MinusCircle } from 'lucide-react';
import type { Question, QuestionFormState } from './types';
import {
  getAnswerForQuestion,
  getAnsweredQuestionSet,
  isQuestionAnswered,
} from './utils';
import { NO_ANSWER_TEXT, QUESTION_KEY_PREFIX } from './constants';
import { QuestionForm } from './question-form';
import { QuestionNavigation } from './question-navigation';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';

interface InteractiveQuestionUIProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
  onCancel: () => void;
}

/**
 * Container for the interactive question UI.
 *
 * Single-question case (length === 1):
 *   - Renders the question form inline.
 *   - Skip == Cancel the whole form.
 *   - Single-select picks auto-submit.
 *
 * Multi-question case (length > 1):
 *   - Tabbed navigation across question headers.
 *   - Progress bar: X of Y answered.
 *   - Previous / Next / Skip / Submit.
 *   - Submit only enables once every question has been answered or skipped.
 *   - Per-question Skip marks the question skipped without resolving the form.
 *   - X dismiss button cancels the whole form.
 */
export function InteractiveQuestionUI({
  questions,
  onSubmit,
  onCancel,
}: InteractiveQuestionUIProps) {
  const [formState, setFormState] = useState<QuestionFormState>({
    selectedAnswers: {},
    customInputs: {},
    otherSelected: {},
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(
    () => new Set(),
  );
  const tabsRootRef = useRef<HTMLDivElement>(null);

  if (!questions || questions.length === 0) return null;

  // ---------- Submission helpers ----------

  const handleSubmit = (skippedOverride: Set<number> = skippedQuestions) => {
    if (isSubmitting || isCancelling) return;
    setIsSubmitting(true);

    const answers: Record<string, string> = {};
    questions.forEach((question, idx) => {
      const key = `${QUESTION_KEY_PREFIX}${idx}`;
      answers[key] = skippedOverride.has(idx)
        ? NO_ANSWER_TEXT
        : getAnswerForQuestion(question, idx, formState);
    });

    onSubmit(answers);
  };

  // Single-question flow: selecting a single-select option auto-submits.
  const handleSingleAnswerSubmit = (answer: string) => {
    if (isSubmitting || isCancelling) return;
    setIsSubmitting(true);
    onSubmit({ [`${QUESTION_KEY_PREFIX}0`]: answer });
  };

  const handleCustomAnswerSubmit = () => {
    if (questions.length !== 1) return;
    const answer = getAnswerForQuestion(questions[0], 0, formState);
    if (!answer.trim()) return;
    handleSingleAnswerSubmit(answer);
  };

  // ---------- Skip / cancel semantics ----------

  const markQuestionSkipped = (questionIndex: number) => {
    const next = new Set(skippedQuestions);
    next.add(questionIndex);

    setSkippedQuestions(next);
    setFormState(prev => ({
      ...prev,
      selectedAnswers: { ...prev.selectedAnswers, [questionIndex]: [] },
      customInputs: { ...prev.customInputs, [questionIndex]: '' },
      otherSelected: { ...prev.otherSelected, [questionIndex]: false },
    }));

    return next;
  };

  // When a previously-skipped question receives input, unskip it.
  const handleFormStateChange =
    (questionIndex: number) =>
    (updater: (prev: QuestionFormState) => QuestionFormState) => {
      setSkippedQuestions(prev => {
        if (!prev.has(questionIndex)) return prev;
        const next = new Set(prev);
        next.delete(questionIndex);
        return next;
      });
      setFormState(updater);
    };

  const handleCancelClick = () => {
    if (isCancelling || isSubmitting) return;
    setIsCancelling(true);
    onCancel();
  };

  // ---------- Derived state ----------

  const answeredQuestions = getAnsweredQuestionSet(questions, formState);
  const completedQuestions = new Set([...answeredQuestions, ...skippedQuestions]);
  const allComplete = completedQuestions.size === questions.length;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isCurrentAnswered =
    isQuestionAnswered(currentQuestion, formState) ||
    skippedQuestions.has(currentQuestion);

  // ---------- Navigation ----------

  const goToPrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const goToNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestion(currentQuestion + 1);
      return;
    }
    // Last question: gate on overall completion.
    if (allComplete) handleSubmit();
  };

  const goToFirstIncomplete = (skippedOverride: Set<number>) => {
    const idx = questions.findIndex(
      (_, i) => !answeredQuestions.has(i) && !skippedOverride.has(i),
    );
    if (idx !== -1) setCurrentQuestion(idx);
  };

  const skipCurrentQuestion = () => {
    if (questions.length === 1) {
      // Single-question case: Skip == cancel.
      handleCancelClick();
      return;
    }

    const skippedAfterUpdate = markQuestionSkipped(currentQuestion);
    const isCompleteAfterSkip = questions.every(
      (_, i) => answeredQuestions.has(i) || skippedAfterUpdate.has(i),
    );

    if (isLastQuestion) {
      if (isCompleteAfterSkip) handleSubmit(skippedAfterUpdate);
      else goToFirstIncomplete(skippedAfterUpdate);
      return;
    }

    setCurrentQuestion(currentQuestion + 1);
  };

  // Keep active tab in view as it changes.
  useEffect(() => {
    const el = tabsRootRef.current?.querySelector<HTMLElement>(
      `[data-tab-index="${currentQuestion}"]`,
    );
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [currentQuestion]);

  // ---------- Render ----------

  // Single-question case: simpler inline form, no tabs, no per-question skip.
  if (questions.length === 1) {
    return (
      <div className="flex flex-col gap-2">
        <QuestionForm
          question={questions[0]}
          questionIndex={0}
          formState={formState}
          onFormStateChange={setFormState}
          onSingleSelectAnswer={handleSingleAnswerSubmit}
          onCustomAnswerSubmit={handleCustomAnswerSubmit}
          onDismiss={handleCancelClick}
          onSkip={handleCancelClick}
          isCancelling={isCancelling}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  return (
    <Tabs
      ref={tabsRootRef}
      value={String(currentQuestion)}
      onValueChange={value => setCurrentQuestion(Number(value))}
      className="flex flex-col gap-2"
    >
      {/* Progress header */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
          <span className="font-medium">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="font-medium">
            {completedQuestions.size} of {questions.length} answered
          </span>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--user-bubble)' }}
        >
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${(completedQuestions.size / questions.length) * 100}%`,
              backgroundColor: 'var(--primary)',
            }}
          />
        </div>
      </div>

      {/* Tab list */}
      <TabsList
        className="flex w-full gap-1 overflow-x-auto px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {questions.map((question, idx) => {
          // Three indicator states:
          //   skipped   → muted MinusCircle (matches the cancelled badge style)
          //   answered  → green CheckCircle2
          //   pending   → numbered bubble on user-bubble background
          const isSkipped = skippedQuestions.has(idx);
          const isAnswered = answeredQuestions.has(idx);
          const indicatorTone = isAnswered
            ? 'var(--success)'
            : isSkipped
              ? 'var(--muted)'
              : 'var(--muted)';
          const indicatorBg = isAnswered || isSkipped ? 'transparent' : 'var(--user-bubble)';

          return (
            <TabsTrigger
              key={idx}
              value={String(idx)}
              data-tab-index={idx}
              className="border border-transparent data-[state=active]:border-[var(--border)]"
            >
              <span
                className="flex items-center justify-center size-5 rounded-full text-[10px] font-semibold transition-colors"
                style={{ color: indicatorTone, backgroundColor: indicatorBg }}
              >
                {isSkipped ? (
                  <MinusCircle className="size-3" style={{ color: 'var(--muted)' }} />
                ) : isAnswered ? (
                  <CheckCircle2 className="size-3" style={{ color: 'var(--success)' }} />
                ) : (
                  idx + 1
                )}
              </span>
              <span className="max-w-[120px] truncate">{question.header}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      {/* Active question + navigation */}
      <div>
        {questions.map((question, idx) => {
          if (idx !== currentQuestion) return null;
          return (
            <div key={idx}>
              <QuestionForm
                question={question}
                questionIndex={idx}
                formState={formState}
                onFormStateChange={handleFormStateChange(idx)}
                onDismiss={handleCancelClick}
                isCancelling={isCancelling}
                isSubmitting={isSubmitting}
              />
              <QuestionNavigation
                currentQuestion={currentQuestion}
                totalQuestions={questions.length}
                canGoNext={isLastQuestion ? allComplete : isCurrentAnswered}
                onPrevious={goToPrevious}
                onNext={goToNext}
                onSkip={skipCurrentQuestion}
                isCancelling={isCancelling}
                isSubmitting={isSubmitting}
              />
            </div>
          );
        })}
      </div>
    </Tabs>
  );
}
