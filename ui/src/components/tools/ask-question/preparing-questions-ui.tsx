import { ListChecks } from 'lucide-react';
import type { AskUserQuestionInput } from './types';
import { parseQuestions } from './utils';
import { Skeleton } from '../../ui/skeleton';
import { Spinner } from '../../ui/spinner';

interface PreparingQuestionsUIProps {
  /** Partial args that may still be streaming in. */
  args: Partial<AskUserQuestionInput>;
  argsRaw?: string;
}

const PLACEHOLDER_OPTION_COUNT = 3;

/**
 * Streaming-state UI for `ask_user_question`.
 */
export function PreparingQuestionsUI({ args }: PreparingQuestionsUIProps) {
  const parsed = parseQuestions(args.questions as never) ?? [];
  const hint = parsed[0];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
        <Spinner size="sm" tone="muted" label="Preparing questions" />
        <span>Preparing questions…</span>
      </div>

      <div className="space-y-1.5">
        <SkeletonQuestion hint={hint} />
      </div>
    </div>
  );
}

function SkeletonQuestion({
  hint,
}: {
  hint?: { header?: string; question?: string; options?: { label: string }[] };
}) {
  const optionCount = hint?.options?.length ?? PLACEHOLDER_OPTION_COUNT;
  return (
    <div
      className="rounded-md border border-dashed px-3 py-2.5 space-y-2"
      style={{ borderColor: 'var(--tool-border)' }}
    >
      <div className="flex items-center gap-2">
        <ListChecks className="size-3 opacity-60" style={{ color: 'var(--muted)' }} />
        <span
          className="text-xs font-medium opacity-70"
          style={{ color: 'var(--muted)' }}
        >
          {hint?.header ?? '—'}
        </span>
      </div>
      <div
        className="text-sm leading-snug opacity-60"
        style={{ color: 'var(--foreground)' }}
      >
        {hint?.question ?? <Skeleton className="h-4 w-3/4" />}
      </div>
      <div className="space-y-1 pt-0.5">
        {Array.from({ length: optionCount }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 rounded-sm px-2 py-1.5">
            <div
              className="size-3 rounded-full border opacity-40"
              style={{ borderColor: 'var(--border)' }}
            />
            <Skeleton className={`h-2.5 ${i === optionCount - 1 ? 'w-1/3' : 'w-2/3'}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
