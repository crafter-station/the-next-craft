"use client";

import { useTransition } from "react";

import { toggleAgendaBlock } from "@/lib/dashboard/actions";
import { cn } from "@/lib/utils";

export function AgendaToggle({
  time,
  saved,
  saveLabel,
  savedLabel,
}: {
  time: string;
  saved: boolean;
  saveLabel: string;
  savedLabel: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      onClick={() => start(() => void toggleAgendaBlock(time))}
      disabled={pending}
      aria-pressed={saved}
      className={cn(
        "shrink-0 border px-2 py-1 font-mono text-[10px] tracking-[0.1em] uppercase transition-colors disabled:opacity-40",
        saved
          ? "border-[var(--bone)] bg-[var(--bone)] text-[var(--void)]"
          : "border-[var(--line)] text-[var(--text-dim)] hover:text-[var(--bright)]",
      )}
    >
      {pending ? "···" : saved ? savedLabel : saveLabel}
    </button>
  );
}
