/**
 * Type contracts for the `request_color` UI tool.
 *
 * The agent can call this tool when it needs the user to pick a specific
 * color (theme tokens, illustration fills, error/warning styling, etc).
 *
 * The tool always submits a single chosen color in the format the agent
 * asked for (`hex` / `rgb` / `hsl` / `hsb`). If the agent doesn't specify
 * a format, the tool falls back to `hex` for portability.
 */

/** Color formats the agent can request. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsb';

/**
 * Optional preset colors the agent can suggest. Each entry is rendered as a
 * small swatch under the picker; clicking one sets the picker value.
 */
export interface ColorPreset {
  label?: string;
  /** Color in any CSS color format (`#3b82f6`, `rgb(...)`, `hsl(...)`, …). */
  value: string;
}

/**
 * Args streamed in from the agent. All fields are optional so the tool can
 * gracefully render the "preparing" UI before the args are complete.
 */
export interface RequestColorInput {
  /** Human-readable label for what the color is for (e.g. "Primary CTA"). */
  title?: string;
  /**
   * Optional helper text under the title (e.g. "Used for the page accent").
   * Free-form — no length limit.
   */
  description?: string;
  /**
   * Suggested initial color. Accepts any CSS color format that the picker
   * understands (hex / rgb / hsl / hsb). Defaults to `#3b82f6` (indigo-500).
   */
  defaultValue?: string;
  /** Color format the agent wants back. Defaults to `hex`. */
  format?: ColorFormat;
  /** Whether to expose the alpha slider (transparency). Defaults to `true`. */
  withAlpha?: boolean;
  /**
   * Optional preset swatches shown below the picker. Useful for suggesting
   * brand colors or theme palettes.
   */
  presets?: ColorPreset[];
}

/**
 * Result payload sent to the backend when the user submits / cancels.
 *  - `cancelled: true`  → user dismissed the form. `color` is `null`.
 *  - `cancelled: false` → user picked a color. `color` is the chosen value
 *                         in the agent-requested format.
 */
export interface RequestColorResult {
  success: boolean;
  cancelled: boolean;
  /** The color in the requested format, or `null` if cancelled. */
  color: string | null;
  /** Format the color is encoded in (always matches the agent's request). */
  format: ColorFormat;
  /** Human-readable status message included in the success/failure payload. */
  feedback?: string;
}
