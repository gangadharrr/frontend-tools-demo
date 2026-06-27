import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const spinnerVariants = cva('animate-spin shrink-0', {
  variants: {
    size: {
      xs: 'size-3',
      sm: 'size-3.5',
      md: 'size-4',
      lg: 'size-5',
    },
    tone: {
      primary: 'text-[var(--primary)]',
      muted: 'text-[var(--muted)]',
      inherit: 'text-current',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'primary',
  },
});

export interface SpinnerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Loader2>, 'size'>,
    VariantProps<typeof spinnerVariants> {
  /** Accessible label for screen readers; defaults to "Loading". */
  label?: string;
}

/**
 * Animated loading spinner. Wraps lucide-react's `Loader2` with our design
 * tokens + size variants so call sites stop hand-rolling
 * `<Loader2 className="size-X animate-spin text-Y" />`.
 */
export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, tone, label = 'Loading', ...props }, ref) => {
    return (
      <Loader2
        ref={ref}
        role="status"
        aria-label={label}
        data-slot="spinner"
        className={cn(spinnerVariants({ size, tone }), className)}
        {...props}
      />
    );
  },
);
Spinner.displayName = 'Spinner';
