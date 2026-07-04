import { Palette } from 'lucide-react';
import type { RequestColorInput } from './types';
import { COLOR_PICKER_MESSAGES } from './constants';
import { Skeleton } from '../../ui/skeleton';
import { Spinner } from '../../ui/spinner';

/**
 * Streaming-state UI for `request_color`. Shown while args are still arriving.
 * Mirrors the final layout at a low fidelity so the layout doesn't jump.
 */
export function PreparingColorPicker({ args }: { args: Partial<RequestColorInput> }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-lg border border-dashed border-[var(--tool-border)] bg-[var(--card)] p-3"
      data-slot="color-picker-tool-preparing"
    >
      <header className="flex items-start gap-2">
        <span
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: 'var(--user-bubble)', color: 'var(--primary)' }}
        >
          <Palette className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton
            className="h-3.5"
            style={args.title ? undefined : { width: '60%' }}
          />
          {args.title && (
            <p
              className="text-sm font-semibold leading-snug"
              style={{ color: 'var(--foreground)' }}
            >
              {args.title}
            </p>
          )}
          {args.description && (
            <p
              className="text-xs leading-snug"
              style={{ color: 'var(--muted)' }}
            >
              {args.description}
            </p>
          )}
        </div>
      </header>

      <div className="flex items-center gap-2">
        <Skeleton className="size-9 rounded-md" />
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="size-9 rounded-md" />
      </div>

      <Skeleton className="h-40 w-full rounded-sm" />
      <Skeleton className="h-3 w-full" />

      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
        <Spinner size="sm" tone="muted" />
        <span>{COLOR_PICKER_MESSAGES.PREPARING}</span>
      </div>
    </div>
  );
}
