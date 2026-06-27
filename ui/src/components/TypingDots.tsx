import { cn } from '../utils/cn';

interface TypingDotsProps {
  /** Optional additional classes merged onto the wrapper. */
  className?: string;
  /** Wrapper aria-label for screen readers; defaults to "Loading". */
  label?: string;
}

/**
 * Three-dot animated typing indicator.
 *
 * Visual + animation are owned by the `.typing-dot` utility class
 * (see `index.css` — `dotPulse` keyframe with staggered child delays).
 * This component just renders the triplet in a horizontal flex row
 * with an accessibility label so screen readers don't see bare spans.
 */
export function TypingDots({ className, label = 'Loading' }: TypingDotsProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('flex items-center gap-1 py-1', className)}
    >
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}
