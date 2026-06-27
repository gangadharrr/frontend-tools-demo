import type { HTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Tailwind sizing utilities to apply (e.g. `h-4 w-1/2`).
   * No defaults — Skeletons are almost always content-shaped, so the
   * caller decides the geometry rather than the component.
   */
}

/**
 * Pulsing placeholder. Always `rounded-md` + `animate-pulse` + `--border`
 * background so callers only worry about geometry (`h-*`, `w-*`).
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md', className)}
      style={{ backgroundColor: 'var(--border)' }}
      {...props}
    />
  );
}
