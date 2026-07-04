/**
 * Shared display strings for the `request_color` tool.
 *
 * Centralizing them here keeps the renderers tidy and makes it easy to
 * tune the wording without hunting through component code.
 */

export const DEFAULT_COLOR_VALUE = '#3b82f6'; // indigo-500 — matches the app's primary token

export const COLOR_PICKER_MESSAGES = {
  CANCELLED: 'User cancelled the color picker',
  REJECTED: 'Color picker was skipped',
  PREPARING: 'Preparing color picker…',
  CANCEL: 'Cancel',
  PICK: 'Pick color',
  RESET: 'Reset',
  PRESETS_HEADER: 'Suggested',
  SUBMITTING: 'Applying…',
};

export const COLOR_FORMAT_LABELS = {
  hex: 'HEX',
  rgb: 'RGB',
  hsl: 'HSL',
  hsb: 'HSB',
} as const;
