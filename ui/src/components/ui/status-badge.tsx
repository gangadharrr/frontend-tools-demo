import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const statusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 text-xs py-0.5',
  {
    variants: {
      tone: {
        success: 'text-[var(--success)]',
        error: 'text-[var(--error-text)]',
        muted: 'text-[var(--muted)]',
      },
    },
    defaultVariants: {
      tone: 'muted',
    },
  },
);

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>,
    VariantProps<typeof statusBadgeVariants> {
  /** Icon component from lucide-react. Sized automatically to 12px. */
  icon: LucideIcon;
  /** Label text. */
  children: ReactNode;
}

/**
 * Compact "icon + label" badge for status indicators (success / failure /
 * cancelled / error / loading). Consolidates the 5 ad-hoc inline duplications
 * that previously existed in `cancelled-answers-ui.tsx` and `OutcomeHeader`.
 */
export function StatusBadge({ icon: Icon, tone, className, children, ...props }: StatusBadgeProps) {
  return (
    <div
      data-slot="status-badge"
      className={cn(statusBadgeVariants({ tone }), className)}
      {...props}
    >
      <Icon className="size-3 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
