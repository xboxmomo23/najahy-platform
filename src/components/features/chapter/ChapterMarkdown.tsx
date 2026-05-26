"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { MathRender } from "@/components/shared/MathRender";
import { cn } from "@/lib/utils";

function hasLatex(text: string): boolean {
  return (
    text.includes("$") ||
    text.includes("\\(") ||
    text.includes("\\[") ||
    text.includes("\\begin{")
  );
}

function renderInlineWithLatex(text: string): React.ReactNode[] {
  const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const match of text.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > last) {
      nodes.push(<span key={`t-${key++}`}>{text.slice(last, index)}</span>);
    }
    const token = match[0];
    if (token.startsWith("$$")) {
      nodes.push(
        <MathRender key={`b-${key++}`} latex={token.slice(2, -2).trim()} block />,
      );
    } else {
      nodes.push(
        <MathRender key={`i-${key++}`} latex={token.slice(1, -1).trim()} />,
      );
    }
    last = index + token.length;
  }

  if (last < text.length) {
    nodes.push(<span key={`t-${key++}`}>{text.slice(last)}</span>);
  }

  return nodes.length > 0 ? nodes : [text];
}

function MarkdownParagraph({ children }: { children?: React.ReactNode }) {
  if (typeof children === "string" && hasLatex(children)) {
    return (
      <p className="mb-5 leading-relaxed text-ink/90">
        {renderInlineWithLatex(children)}
      </p>
    );
  }

  return (
    <p className="mb-5 leading-relaxed text-ink/90">{children}</p>
  );
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h2 className="mb-4 mt-10 font-display text-3xl font-semibold text-emerald-900 first:mt-0">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 className="mb-3 mt-8 font-display text-2xl font-semibold text-emerald-900">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-2 mt-6 font-display text-xl font-semibold text-emerald-800">
      {children}
    </h4>
  ),
  p: ({ children }) => <MarkdownParagraph>{children}</MarkdownParagraph>,
  ul: ({ children }) => (
    <ul className="mb-5 list-disc space-y-2 pl-6 text-ink/90">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 list-decimal space-y-2 pl-6 text-ink/90">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-gold-400 bg-gold-100/50 px-4 py-3 text-emerald-900">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg bg-paper px-4 py-3 font-mono text-sm text-ink">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-sm text-emerald-900">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-6 overflow-x-auto rounded-xl border border-sand bg-paper p-4">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-medium text-emerald-800 underline underline-offset-2 hover:text-emerald-900"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-emerald-900">{children}</strong>
  ),
  hr: () => <hr className="my-8 border-sand" />,
  table: ({ children }) => (
    <div className="mb-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-sand bg-paper px-3 py-2 text-left font-medium text-emerald-900">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-sand px-3 py-2 text-ink/90">{children}</td>
  ),
};

export interface ChapterMarkdownProps {
  content: string;
  className?: string;
}

export function ChapterMarkdown({ content, className }: ChapterMarkdownProps) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-muted">Contenu non disponible pour le moment.</p>
    );
  }

  return (
    <div
      className={cn(
        "chapter-markdown max-w-none text-base",
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
