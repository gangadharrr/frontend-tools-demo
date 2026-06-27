import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

/**
 * Plain text input styled to match the design tokens.
 *
 * For most use cases this is enough — it forwards refs, accepts a
 * `className`, and reads `--input-bg` / `--foreground` / `--border`
 * from the theme so light + dark mode work without extra wiring.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          'h-8 w-full rounded border px-2 text-sm transition-colors',
          'placeholder:text-[var(--muted)]',
          'focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-1 focus:ring-offset-[var(--page)]',
          'disabled:pointer-events-none disabled:opacity-50',
          className,
        )}
        style={{
          backgroundColor: 'var(--input-bg)',
          color: 'var(--foreground)',
          borderColor: 'var(--border)',
        }}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
