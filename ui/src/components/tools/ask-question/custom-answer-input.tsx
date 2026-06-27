import { CUSTOM_INPUT_PLACEHOLDER } from './constants';

interface CustomAnswerInputProps {
  questionIndex: number;
  value: string;
  onChange: (value: string) => void;
  /** Optional Enter-key handler — used in single-question auto-submit flow. */
  onSubmit?: () => void;
}

/**
 * Inline input shown inside the "Other" OptionCard.
 * Stops click/keyboard propagation so it doesn't toggle its own row.
 */
export function CustomAnswerInput({
  questionIndex,
  value,
  onChange,
  onSubmit,
}: CustomAnswerInputProps) {
  return (
    <input
      id={`custom-${questionIndex}`}
      type="text"
      placeholder={CUSTOM_INPUT_PLACEHOLDER}
      value={value}
      onClick={event => event.stopPropagation()}
      onKeyDown={event => {
        event.stopPropagation();
        if (event.key === 'Enter' && onSubmit) {
          event.preventDefault();
          onSubmit();
        }
      }}
      onChange={event => {
        event.stopPropagation();
        onChange(event.target.value);
      }}
      className="h-8 min-w-0 flex-1 rounded border bg-transparent px-2 text-sm shadow-none focus:outline-none focus:ring-0"
      style={{
        borderColor: 'transparent',
        color: 'var(--foreground)',
      }}
    />
  );
}
