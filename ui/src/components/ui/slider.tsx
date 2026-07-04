import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '../../utils/cn';

/**
 * Thin styled wrappers around Radix UI's Slider primitives.
 *
 * The default export `Slider` is a complete, ready-to-use slider with the
 * project's design tokens baked in (track, range fill, thumb). Advanced
 * compositions can reach into the named parts:
 *
 *   <Slider />                       — fully styled, default API
 *
 *   <Slider.Root>
 *     <Slider.Track>
 *       <Slider.Range />             — transparent by default
 *       {/_ custom overlay _/}
 *     </Slider.Track>
 *     <Slider.Thumb />
 *   </Slider.Root>
 *
 * The transparent Range is intentional: the color-picker overlays its own
 * transparent-to-color gradient on top of the Range, so the Range needs to
 * let that gradient show through.
 */

const SliderRoot = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    data-slot="slider"
    className={cn(
      'relative flex w-full touch-none select-none items-center',
      className,
    )}
    {...props}
  />
));
SliderRoot.displayName = SliderPrimitive.Root.displayName;

const SliderTrack = forwardRef<
  ElementRef<typeof SliderPrimitive.Track>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Track>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Track
    ref={ref}
    data-slot="slider-track"
    className={cn(
      'relative h-2 w-full grow overflow-hidden rounded-full bg-[var(--user-bubble)]',
      className,
    )}
    {...props}
  />
));
SliderTrack.displayName = SliderPrimitive.Track.displayName;

/**
 * Transparent by default — consumers wanting a colored fill should pass
 * `bg-[var(--primary)]` (or another token) via `className`.
 *
 * The default `<Slider />` does this for you.
 */
const SliderRange = forwardRef<
  ElementRef<typeof SliderPrimitive.Range>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Range>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Range
    ref={ref}
    data-slot="slider-range"
    className={cn('absolute h-full', className)}
    {...props}
  />
));
SliderRange.displayName = SliderPrimitive.Range.displayName;

const SliderThumb = forwardRef<
  ElementRef<typeof SliderPrimitive.Thumb>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Thumb>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Thumb
    ref={ref}
    data-slot="slider-thumb"
    className={cn(
      'block size-4 rounded-full border-2 border-[var(--card)] bg-[var(--foreground)] shadow-sm transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page)]',
      'disabled:pointer-events-none disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
SliderThumb.displayName = SliderPrimitive.Thumb.displayName;

/**
 * Default slider — composes Root / Track / Range / Thumb with the project's
 * design tokens so callers get a fully styled component out of the box.
 */
const SliderBase = forwardRef<
  ElementRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ children, ...props }, ref) => (
  <SliderRoot ref={ref} {...props}>
    <SliderTrack>
      <SliderRange className="bg-[var(--primary)]" />
    </SliderTrack>
    <SliderThumb />
    {children}
  </SliderRoot>
));
SliderBase.displayName = 'Slider';

/**
 * Namespace export. `Slider` itself behaves like a fully-styled slider, and
 * `.Root`, `.Track`, `.Range`, `.Thumb` give access to the underlying parts
 * for advanced compositions (the Dice UI color-picker is the main consumer).
 */
export const Slider = Object.assign(SliderBase, {
  Root: SliderRoot,
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
});
