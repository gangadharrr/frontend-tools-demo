import { Palette, XCircle } from 'lucide-react';
import type { RequestColorInput } from './types';
import { COLOR_PICKER_MESSAGES } from './constants';
import { StatusBadge } from '../../ui/status-badge';

/**
 * "Rejected" state for `request_color`. Shown when the user replied in chat
 * while the picker was still pending — the picker is superseded by the new
 * message. Compact: just a header with the title so the user has context
 * about what was bypassed.
 */
export function RejectedColorPicker({ args }: { args: RequestColorInput }) {
  const title = args.title ?? 'Color picker';

  return (
    <div
      data-slot="color-picker-tool-rejected"
      className="flex items-center gap-2 rounded-lg border border-[var(--tool-border)] bg-[var(--tool-bg)] px-3 py-2"
    >
      <span
        className="flex size-5 shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: 'var(--user-bubble)', color: 'var(--muted)' }}
      >
        <Palette className="size-3" />
      </span>
      <span
        className="truncate text-xs font-medium"
        style={{ color: 'var(--muted)' }}
      >
        {title}
      </span>
      <StatusBadge icon={XCircle} tone="error">
        {COLOR_PICKER_MESSAGES.REJECTED}
      </StatusBadge>
    </div>
  );
}
