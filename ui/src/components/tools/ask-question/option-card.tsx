import { Check, CornerDownLeft, PenLine } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface OptionCardProps {
  id: string;
  isSelected: boolean;
  label: string;
  description?: string;
  /** 1-indexed badge number for non-"Other" options. */
  optionIndex?: number;
  isOther?: boolean;
  isMultiSelect?: boolean;
  /** Slot for replacing the default label (e.g. the "Other" custom input). */
  inlineContent?: React.ReactNode;
  /** Slot for an action on the right (e.g. per-question Skip button). */
  endContent?: React.ReactNode;
  children: React.ReactNode;
  onKeyDown?: (e: React.KeyboardEvent<HTMLLabelElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLLabelElement>) => void;
}

/**
 * A single option in a radio/checkbox group.
 *
 * The `children` slot is the actual input control (radio/checkbox). The
 * surrounding card-style chrome is non-visual from the input's perspective —
 * clicks anywhere on the card toggle the input.
 *
 * Slots:
 * - `inlineContent` overrides the default label rendering (used for "Other").
 * - `endContent` is an action rendered at the far right (used for Skip).
 */
export function OptionCard({
  id,
  isSelected,
  label,
  description,
  optionIndex,
  isOther = false,
  isMultiSelect = false,
  inlineContent,
  endContent,
  children,
  onKeyDown,
  onClick,
}: OptionCardProps) {
  return (
    <label
      htmlFor={id}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      className={cn(
        'group relative flex min-h-10 items-center gap-2.5 rounded-sm px-2.5 py-1.5 transition-colors cursor-pointer',
        isSelected && !isOther
          ? 'bg-[var(--primary)]/10 text-[var(--foreground)]'
          : 'text-[var(--muted)] hover:bg-[var(--user-bubble)] hover:text-[var(--foreground)]',
      )}
    >
      {/* Visually-hidden text label of the actual input control. */}
      <span className="sr-only">{children}</span>

      {/* Glyph slot (number / check / pen). */}
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-sm text-[11px] font-semibold transition-colors',
          isSelected && !isOther
            ? 'bg-[var(--primary)] text-[var(--inverse-text)]'
            : 'bg-[var(--user-bubble)] text-[var(--muted)] group-hover:text-[var(--foreground)]',
        )}
        aria-hidden="true"
      >
        {isOther ? (
          <PenLine className="size-3.5" />
        ) : isMultiSelect && isSelected ? (
          <Check className="size-3.5" />
        ) : (
          optionIndex
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {inlineContent ?? (
            <span
              className={cn(
                'truncate text-sm leading-5',
                isSelected ? 'text-[var(--foreground)]' : 'group-hover:text-[var(--foreground)]',
              )}
            >
              {label}
            </span>
          )}
          {description && <span className="sr-only">{description}</span>}
        </div>
      </div>

      {endContent}

      {isSelected && !isMultiSelect && !isOther && (
        <CornerDownLeft className="size-3.5 shrink-0 text-[var(--muted)]" aria-hidden="true" />
      )}
    </label>
  );
}
