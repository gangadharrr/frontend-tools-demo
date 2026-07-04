import { CheckCircle2, Palette, XCircle } from 'lucide-react';
import type { RequestColorInput, RequestColorResult } from './types';
import { StatusBadge } from '../../ui/status-badge';

interface CompletedColorPickerProps {
  args: RequestColorInput;
  result?: RequestColorResult;
  outcome: 'success' | 'cancelled' | 'failure' | 'error';
}

/**
 * Final-state UI for the `request_color` tool. Shows the picked color
 * alongside the title, with a success/cancelled badge so the chat history
 * stays scannable.
 */
export function CompletedColorPicker({
  args,
  result,
  outcome,
}: CompletedColorPickerProps) {
  const title = args.title ?? 'Color';
  const cancelled = outcome === 'cancelled';
  const color = result?.color ?? null;

  return (
    <div
      data-slot="color-picker-tool-completed"
      className="flex items-start gap-3 rounded-lg border border-[var(--tool-border)] bg-[var(--tool-bg)] p-3"
    >
      <ColorSwatch color={color} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className="flex size-5 shrink-0 items-center justify-center rounded"
            style={{
              backgroundColor: 'var(--user-bubble)',
              color: 'var(--primary)',
            }}
          >
            <Palette className="size-3" />
          </span>
          <span
            className="truncate text-sm font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </span>
          {cancelled ? (
            <StatusBadge icon={XCircle} tone="muted">
              Cancelled
            </StatusBadge>
          ) : (
            <StatusBadge icon={CheckCircle2} tone="success">
              Applied
            </StatusBadge>
          )}
        </div>

        {args.description && !cancelled && (
          <p
            className="mt-0.5 truncate text-xs"
            style={{ color: 'var(--muted)' }}
          >
            {args.description}
          </p>
        )}

        {!cancelled && color && (
          <p
            className="mt-1 font-mono text-xs"
            style={{ color: 'var(--foreground)' }}
          >
            {color}
          </p>
        )}

        {cancelled && (
          <p className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
            {result?.feedback ?? 'User cancelled the color picker'}
          </p>
        )}
      </div>
    </div>
  );
}

function ColorSwatch({ color }: { color: string | null }) {
  if (!color) {
    return (
      <div
        aria-hidden
        className="size-10 shrink-0 rounded-md border border-dashed border-[var(--border)]"
        style={{
          background:
            'linear-gradient(to bottom right, transparent calc(50% - 1px), var(--muted) calc(50% - 1px) calc(50% + 1px), transparent calc(50% + 1px)) no-repeat',
        }}
      />
    );
  }

  return (
    <div
      aria-label={`Selected color: ${color}`}
      className="size-10 shrink-0 rounded-md border border-[var(--border)] shadow-sm"
      style={{
        // Mirror the diceui swatch's transparent fallback for alpha < 1.
        background: `linear-gradient(${color}, ${color}), repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0% 50% / 8px 8px`,
      }}
    />
  );
}
