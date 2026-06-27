import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { cn } from '../../utils/cn';

export const Collapsible = CollapsiblePrimitive.Root;

export const CollapsibleTrigger = forwardRef<
  ElementRef<typeof CollapsiblePrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    data-slot="collapsible-trigger"
    className={cn('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] rounded', className)}
    {...props}
  />
));
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName;

export const CollapsibleContent = forwardRef<
  ElementRef<typeof CollapsiblePrimitive.Content>,
  ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    data-slot="collapsible-content"
    className={cn('overflow-hidden', className)}
    {...props}
  />
));
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName;
