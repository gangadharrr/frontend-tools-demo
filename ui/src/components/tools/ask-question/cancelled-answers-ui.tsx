import { MinusCircle } from 'lucide-react';

export function CancelledAnswersUI() {
  return (
    <div className="flex items-center gap-1.5 text-xs py-0.5" style={{ color: 'var(--muted)' }}>
      <MinusCircle className="size-3 shrink-0" />
      <span>Questions skipped</span>
    </div>
  );
}
