"use client";

import type { SubjectScore } from "@/lib/diagnostic/scoring";
import { cn } from "@/lib/utils";

import {
  getPlanCellIntensity,
  INTENSITY_CELL_CLASS,
} from "./diagnostic-results-helpers";

export function StudyPlanGrid({
  subjects,
  weekCount,
}: {
  subjects: SubjectScore[];
  weekCount: number;
}) {
  const weekLabels = Array.from({ length: weekCount }, (_, i) => `S${i + 1}`);

  return (
    <div className="overflow-x-auto rounded-xl border border-sand bg-cream">
      <table className="w-full min-w-[640px] border-collapse text-xs">
        <thead>
          <tr className="border-b border-sand bg-paper">
            <th className="sticky left-0 z-10 bg-paper px-3 py-2 text-left font-medium text-muted">
              Matière
            </th>
            {weekLabels.map((label) => (
              <th
                key={label}
                className="px-1 py-2 text-center font-medium text-muted"
              >
                {label}
              </th>
            ))}
            <th className="px-1 py-2 text-center font-medium text-coral">Bac blanc</th>
            <th className="px-1 py-2 text-center font-medium text-coral">Bac blanc</th>
            <th className="px-1 py-2 text-center font-medium text-emerald-800">J</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => (
            <tr key={subject.subjectSlug} className="border-b border-sand/80 last:border-0">
              <td className="sticky left-0 z-10 bg-cream px-3 py-2 font-medium text-emerald-900">
                {subject.subjectName}
              </td>
              {weekLabels.map((label, weekIndex) => {
                const intensity = getPlanCellIntensity(
                  subject.tone,
                  weekIndex,
                  weekCount,
                );
                return (
                  <td key={label} className="p-1">
                    <div
                      className={cn(
                        "flex h-8 items-center justify-center rounded-md text-[10px] font-medium",
                        INTENSITY_CELL_CLASS[intensity],
                      )}
                      title={`Semaine ${weekIndex + 1}`}
                    >
                      {intensity === "rest" ? "·" : "●"}
                    </div>
                  </td>
                );
              })}
              <td className="p-1">
                <div className="flex h-8 items-center justify-center rounded-md bg-coral/20 text-[10px] font-semibold text-coral">
                  ✎
                </div>
              </td>
              <td className="p-1">
                <div className="flex h-8 items-center justify-center rounded-md bg-coral/30 text-[10px] font-semibold text-coral">
                  ✎
                </div>
              </td>
              <td className="p-1">
                <div className="flex h-8 items-center justify-center rounded-md bg-emerald-800 text-[10px] font-bold text-gold-400">
                  🎓
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
