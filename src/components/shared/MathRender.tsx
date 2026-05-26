"use client";

import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

import { cn } from "@/lib/utils";

export interface MathRenderProps {
  latex: string;
  /** `true` = formule centrée en bloc ; `false` = inline dans le texte */
  block?: boolean;
  className?: string;
}

function LatexFallback({ latex, block }: { latex: string; block: boolean }) {
  return (
    <span
      className={cn(
        "font-mono text-[1.05em] leading-relaxed text-ink",
        block && "my-3 block overflow-x-auto rounded-lg bg-paper px-3 py-2 text-center",
        !block && "inline align-middle",
      )}
      title="Formule non rendue"
    >
      {latex}
    </span>
  );
}

/**
 * Affiche une formule LaTeX via KaTeX, avec repli sur le texte brut si invalide.
 */
export function MathRender({ latex, block = false, className }: MathRenderProps) {
  const trimmed = latex.trim();
  if (!trimmed) return null;

  const wrapperClass = cn(
    "text-ink [&_.katex]:text-[1.05em] [&_.katex]:text-ink",
    block && "my-4 block w-full overflow-x-auto text-center",
    !block && "inline-block align-middle",
    className,
  );

  const renderError = () => <LatexFallback latex={trimmed} block={block} />;

  try {
    if (block) {
      return (
        <div className={wrapperClass}>
          <BlockMath math={trimmed} renderError={renderError} errorColor="#c97064" />
        </div>
      );
    }

    return (
      <span className={wrapperClass}>
        <InlineMath math={trimmed} renderError={renderError} errorColor="#c97064" />
      </span>
    );
  } catch {
    return <LatexFallback latex={trimmed} block={block} />;
  }
}
