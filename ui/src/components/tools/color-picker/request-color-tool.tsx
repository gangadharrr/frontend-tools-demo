import { z } from 'zod';
import { useTool } from '../../../hooks/useTool';
import type {
  ColorFormat,
  RequestColorInput,
  RequestColorResult,
} from './types';
import { InteractiveColorPicker } from './interactive-color-picker';
import { PreparingColorPicker } from './preparing-color-picker';
import { CompletedColorPicker } from './completed-color-picker';
import { RejectedColorPicker } from './rejected-color-picker';
import { COLOR_PICKER_MESSAGES, DEFAULT_COLOR_VALUE } from './constants';

const colorFormatSchema = z.enum(['hex', 'rgb', 'hsl', 'hsb']);

const colorPresetSchema = z.object({
  label: z.string().optional().describe('Optional human-readable label'),
  value: z
    .string()
    .describe(
      'CSS color value (hex, rgb, hsl, hsb). Used for both display and selection.',
    ),
});

const schema = z.object({
  title: z
    .string()
    .optional()
    .describe(
      'Short title for the picker (e.g. "Primary CTA color"). Defaults to "Pick color".',
    ),
  description: z
    .string()
    .optional()
    .describe(
      'Optional helper text shown below the title to give the user context.',
    ),
  defaultValue: z
    .string()
    .optional()
    .describe(
      'Suggested initial color. Accepts any CSS color format (hex, rgb, hsl, hsb). Defaults to #3b82f6.',
    ),
  format: colorFormatSchema
    .optional()
    .describe(
      'Color format to return. Defaults to "hex". The picker can switch formats at any time, but the final submitted value follows this format.',
    ),
  withAlpha: z
    .boolean()
    .optional()
    .describe('Whether to expose the alpha (transparency) slider. Defaults to true.'),
  presets: z
    .array(colorPresetSchema)
    .optional()
    .describe(
      'Optional preset swatches shown under the picker. Useful for brand palettes or themed options.',
    ),
});

/**
 * The `request_color` tool — registers the four lifecycle renderers against
 * the shared UI tool system:
 *   - streaming        → PreparingColorPicker (skeleton + spinner)
 *   - waitingForInput  → InteractiveColorPicker (full picker UI)
 *   - responded        → CompletedColorPicker (shows picked color + badge)
 *   - rejected         → RejectedColorPicker (compact "skipped" badge)
 *
 * The result is forwarded to the backend via `handle()`, which wraps the
 * user's selection into the standard `commandResponse` envelope.
 */
export function RequestColorTool() {
  useTool<RequestColorInput, RequestColorResult>({
    name: 'request_color',
    description: `Ask the user to pick a color using an interactive color picker.

Use this when you need a specific color value to make a design decision
(themes, accents, illustration fills, status colors, etc.).

Features:
- Title and optional description for context
- Initial default color (defaults to indigo-500 #3b82f6)
- Four color formats: hex, rgb, hsl, hsb (user can switch at any time)
- Optional alpha slider for transparency
- Optional preset swatches (e.g. brand colors)
- Eye-dropper button (Chrome/Edge only) for picking from the screen

The picker always returns the color in the requested format. If you don't
specify a format, "hex" is used.

Best practices:
- Provide a short, descriptive title so the user knows what's being styled.
- Use the description field to give context (which component, which theme).
- Pass presets when there's a constrained palette (e.g. brand colors).
- Only request alpha when transparency is actually meaningful for the use case.`,
    schema,
    render: {
      // 1. STREAMING — args are still arriving. Lightweight skeleton.
      streaming: ({ args }) => <PreparingColorPicker args={args} />,

      // 2. WAITING FOR INPUT — full args received. Show the interactive picker.
      waitingForInput: ({ args, onSubmit }) => (
        <InteractiveColorPicker
          args={args}
          onSubmit={({ color, format }) =>
            onSubmit({
              success: true,
              cancelled: false,
              color,
              format,
            })
          }
          onCancel={() =>
            onSubmit({
              success: false,
              cancelled: true,
              color: null,
              format: (args.format ?? 'hex') as ColorFormat,
              feedback: COLOR_PICKER_MESSAGES.CANCELLED,
            })
          }
        />
      ),

      // 3. RESPONDED — user has submitted. Show the picked color (or cancellation).
      responded: ({ args, result, outcome }) => (
        <CompletedColorPicker args={args} result={result} outcome={outcome} />
      ),

      // 4. REJECTED — user replied in chat while this was still pending.
      rejected: ({ args }) => <RejectedColorPicker args={args} />,
    },
    handle: (args, result) => {
      if (result.cancelled) {
        return {
          externalToolResponse: 'failure',
          failureMessage: result.feedback ?? COLOR_PICKER_MESSAGES.CANCELLED,
        };
      }

      // result.color is guaranteed non-null when not cancelled, but guard
      // for type-safety in case a future caller forgets.
      const color = result.color ?? args.defaultValue ?? DEFAULT_COLOR_VALUE;
      const format: ColorFormat = result.format ?? args.format ?? 'hex';
      const label = args.title ? `${args.title}: ` : '';

      return {
        externalToolResponse: 'success',
        successMessage: `${label}Picked ${format.toUpperCase()} color ${color}.`,
      };
    },
  });

  return null;
}
