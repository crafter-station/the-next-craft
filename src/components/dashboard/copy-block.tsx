"use client";

import { useState } from "react";

export function CopyBlock({
  label,
  text,
  copyLabel,
  copiedLabel,
}: {
  label: string;
  text: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
          {label}
        </span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              setCopied(false);
            }
          }}
          className="font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--text-dim)] hover:text-[var(--bright)]"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </div>
      <pre className="mt-2.5 overflow-x-auto border border-[var(--line)] bg-[var(--void)] px-3.5 py-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-[var(--text-dim)]">
        {text}
      </pre>
    </div>
  );
}
