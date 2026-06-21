import { Loader2, CheckCircle2 } from 'lucide-react';
import type { ToolCallEntry } from '../types';

interface ToolCallCardProps {
  tool: ToolCallEntry;
}

export function ToolCallCard({ tool }: ToolCallCardProps) {
  const isRunning = tool.status === 'running';

  return (
    <div
      className="rounded-lg border border-[var(--tool-border)] bg-[var(--tool-bg)] overflow-hidden"
      style={{
        borderLeft: `3px solid ${isRunning ? 'var(--primary)' : 'var(--success)'}`,
      }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {isRunning ? (
          <Loader2 className="size-3.5 shrink-0 text-[var(--primary)] animate-spin" />
        ) : (
          <CheckCircle2 className="size-3.5 shrink-0 text-[var(--success)]" />
        )}
        <span className="font-mono text-xs font-medium text-[var(--foreground)]">
          {tool.name}
        </span>
        {isRunning && (
          <span className="ml-auto text-xs text-[var(--muted)]">running…</span>
        )}
      </div>
      {(tool.args || tool.argsRaw) && (
        <pre className="border-t border-[var(--tool-border)] px-3 py-2 font-mono text-xs text-[var(--muted)] overflow-x-auto">
          {formatArgs(tool)}
        </pre>
      )}
      {tool.result && (
        <div className="border-t border-[var(--tool-border)] px-3 py-2 text-xs text-[var(--foreground)] leading-relaxed">
          {tool.result}
        </div>
      )}
    </div>
  );
}

function formatArgs(tool: ToolCallEntry): string {
  if (tool.args) {
    return JSON.stringify(tool.args, null, 2);
  }
  if (tool.argsRaw) {
    return tool.argsRaw;
  }
  return '';
}
