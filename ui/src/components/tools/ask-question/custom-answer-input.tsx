import { Input } from '../../ui/input';
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
 * Stops click + keydown propagation so the wrapping label doesn't toggle
 * its own row.
 */
export function CustomAnswerInput({
  questionIndex,
  value,
  onChange,
  onSubmit,
}: CustomAnswerInputProps) {
  return (
    <Input
      id={`custom-${questionIndex}`}
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
      className="h-8 min-w-0 flex-1 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
    />
  );
}
