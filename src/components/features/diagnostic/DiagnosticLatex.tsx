"use client";

import { MathRender } from "@/components/shared/MathRender";
import { cn } from "@/lib/utils";

/** @deprecated Préfère `MathRender` avec `block` */
export function DiagnosticLatex({ content }: { content: string }) {
  return (
    <MathRender
      latex={content}
      block
      className={cn("rounded-lg bg-paper px-4 py-3")}
    />
  );
}
