import { cn } from "@/lib/utils";

export function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { ok: password.length >= 8, label: "8 caractères minimum" },
    { ok: /[A-Z]/.test(password), label: "1 majuscule" },
    { ok: /[0-9]/.test(password), label: "1 chiffre" },
  ];

  return (
    <ul className="space-y-1" aria-live="polite">
      {checks.map((c) => (
        <li
          key={c.label}
          className={cn(
            "flex items-center gap-2 text-xs",
            c.ok ? "text-emerald-700" : "text-muted",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              c.ok ? "bg-emerald-600" : "bg-sand",
            )}
          />
          {c.label}
        </li>
      ))}
    </ul>
  );
}
