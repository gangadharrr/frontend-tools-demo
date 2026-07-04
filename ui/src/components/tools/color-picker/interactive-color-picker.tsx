import { useCallback, useState } from 'react';
import { Check, Palette, X } from 'lucide-react';
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from '../../ui/color-picker';
import { Button } from '../../ui/button';
import { Spinner } from '../../ui/spinner';
import type {
  ColorFormat,
  ColorPreset,
  RequestColorInput,
} from './types';
import {
  COLOR_PICKER_MESSAGES,
  DEFAULT_COLOR_VALUE,
} from './constants';

interface InteractiveColorPickerProps {
  args: RequestColorInput;
  onSubmit: (result: { color: string; format: ColorFormat }) => void;
  onCancel: () => void;
}

/**
 * Interactive UI for the `request_color` tool. Shown when args are complete
 * and the user needs to make a selection.
 *
 * Renders a "card" with every picker control inline (no popover):
 *   - Title + optional description.
 *   - Swatch + hex/alpha input + eyedropper row.
 *   - 2D saturation / value area.
 *   - Hue slider (rainbow gradient).
 *   - Opacity / alpha slider (checkerboard + gradient).
 *   - Format selector + active color swatch.
 *   - Optional preset swatches (right-aligned).
 *   - Cancel / Apply buttons.
 *
 * All controls bind to the same HSV store so changes stay in sync.
 *
 * The picker is uncontrolled internally — we only read its final value when
 * the user clicks Apply.
 */
export function InteractiveColorPicker({
  args,
  onSubmit,
  onCancel,
}: InteractiveColorPickerProps) {
  const initialValue = args.defaultValue ?? DEFAULT_COLOR_VALUE;
  const format: ColorFormat = args.format ?? 'hex';

  const [value, setValue] = useState<string>(initialValue);
  const [pickedFormat, setPickedFormat] = useState<ColorFormat>(format);
  const [isApplying, setIsApplying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleApply = useCallback(() => {
    if (isApplying || isCancelling) return;
    setIsApplying(true);
    onSubmit({
      color: value,
      format: pickedFormat,
    });
  }, [isApplying, isCancelling, onSubmit, value, pickedFormat]);

  const handleCancel = useCallback(() => {
    if (isApplying || isCancelling) return;
    setIsCancelling(true);
    onCancel();
  }, [isApplying, isCancelling, onCancel]);

  const handlePresetSelect = useCallback((preset: ColorPreset) => {
    setValue(preset.value);
  }, []);

  const showPresets = Array.isArray(args.presets) && args.presets.length > 0;

  return (
    <div
      data-slot="color-picker-tool"
      className="flex flex-col gap-3 rounded-lg border border-[var(--tool-border)] bg-[var(--card)] p-3"
    >
      <header className="flex items-start gap-2">
        <span
          className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md"
          style={{ backgroundColor: 'var(--user-bubble)', color: 'var(--primary)' }}
        >
          <Palette className="size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--foreground)' }}>
            {args.title ?? COLOR_PICKER_MESSAGES.PICK}
          </p>
          {args.description && (
            <p
              className="mt-0.5 text-xs leading-snug"
              style={{ color: 'var(--muted)' }}
            >
              {args.description}
            </p>
          )}
        </div>
      </header>

      <ColorPicker
        value={value}
        onValueChange={setValue}
        format={pickedFormat}
        onFormatChange={setPickedFormat}
        // No popover — every useful control now lives inline in the main
        // card. The trigger swatch is kept for visual parity but stays
        // inert (`defaultOpen={false}` and no `ColorPickerContent`).
        defaultOpen={false}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <ColorPickerTrigger
            aria-label="Open color picker"
            className="h-9 w-9 shrink-0 p-0"
          >
            <ColorPickerSwatch className="size-7" />
          </ColorPickerTrigger>

          <ColorPickerInput className="flex-1" />

          <ColorPickerEyeDropper aria-label="Pick color from screen" />
        </div>

        {/*
         * All picker controls live inline in the main card:
         *   - 2D saturation / value area
         *   - Hue slider (rainbow gradient)
         *   - Opacity / alpha slider (checkerboard + gradient)
         *   - Format selector + active swatch
         *
         * Every component binds to the same HSV store so changes stay
         * in sync across all controls.
         */}
        <ColorPickerArea className="h-40" />
        <ColorPickerHueSlider />
        <ColorPickerAlphaSlider />

        <div className="flex items-center gap-2">
          <ColorPickerFormatSelect />
          <div className="ml-auto">
            <ColorPickerSwatch className="size-7" />
          </div>
        </div>
      </ColorPicker>

      {showPresets && (
        <div
          data-slot="color-picker-presets"
          className="ml-auto flex w-full flex-col items-end gap-1.5 sm:max-w-md"
        >
          <p
            className="text-[10px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--muted)' }}
          >
            {COLOR_PICKER_MESSAGES.PRESETS_HEADER}
          </p>
          <div className="flex flex-wrap justify-end gap-1.5">
            {args.presets!.map((preset, idx) => (
              <button
                key={`${preset.value}-${idx}`}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                aria-label={
                  preset.label
                    ? `Use preset ${preset.label}: ${preset.value}`
                    : `Use preset ${preset.value}`
                }
                title={preset.label ?? preset.value}
                className="group relative flex size-7 items-center justify-center rounded-md border border-[var(--border)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--page)]"
              >
                <span
                  className="block size-5 rounded-sm"
                  style={{ backgroundColor: preset.value }}
                />
                {value.toLowerCase() === preset.value.toLowerCase() && (
                  <Check
                    className="absolute size-3 drop-shadow"
                    style={{ color: 'var(--inverse-text)' }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isApplying || isCancelling}
        >
          {isCancelling ? (
            <Spinner size="sm" tone="muted" />
          ) : (
            <X className="size-3.5" />
          )}
          <span>{COLOR_PICKER_MESSAGES.CANCEL}</span>
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleApply}
          disabled={isApplying || isCancelling}
        >
          {isApplying ? (
            <>
              <Spinner size="sm" tone="inverse" />
              <span>{COLOR_PICKER_MESSAGES.SUBMITTING}</span>
            </>
          ) : (
            <Check className="size-3.5" />
          )}
          <span>Apply</span>
        </Button>
      </footer>
    </div>
  );
}
