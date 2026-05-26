"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { signupStudent } from "@/app/(auth)/inscription/eleve/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared";
import {
  composeBirthdate,
  formatPhone,
  isMinorFromParts,
  zodErrorsToMap,
} from "@/lib/auth/student-signup-utils";
import {
  ALGERIAN_WILAYAS,
  WILAYA_DIASPORA,
} from "@/lib/constants/algerian-wilayas";
import { cn } from "@/lib/utils";
import {
  signupStep1Schema,
  signupStep2Schema,
  signupStep3Schema,
  signupStep4Schema,
  type FullStudentSignup,
} from "@/lib/validations/auth";

const STEPS = [
  {
    id: 1,
    title: "Ton compte",
    subtitle: "Email, mot de passe",
  },
  {
    id: 2,
    title: "Tes infos scolaires",
    subtitle: "Filière, niveau, wilaya",
  },
  {
    id: 3,
    title: "Tes objectifs",
    subtitle: "Note visée, temps dispo",
  },
  {
    id: 4,
    title: "C'est parti",
    subtitle: "Préférences finales",
  },
] as const;

const FILIERES = [
  { value: "sciences_exp", label: "Sciences expérimentales", enabled: true },
  { value: "mathematiques", label: "Mathématiques", enabled: false },
  { value: "techniques_math", label: "Techniques math", enabled: false },
  { value: "gestion_eco", label: "Gestion & économie", enabled: false },
  { value: "lettres_philo", label: "Lettres & philosophie", enabled: false },
  { value: "langues", label: "Langues", enabled: false },
] as const;

const TARGET_SCORES = [
  { value: 10, label: "10/20", subtitle: "BAC" },
  { value: 14, label: "14/20", subtitle: "Mention Bien" },
  { value: 16, label: "16/20", subtitle: "Très Bien" },
  { value: 18, label: "18+/20", subtitle: "Médecine / ENS" },
] as const;

const HOURS_OPTIONS = [
  { value: 5, label: "≤5h" },
  { value: 8, label: "5-10h" },
  { value: 12, label: "10-15h" },
  { value: 20, label: "15h+" },
] as const;

const FOCUS_AREAS = [
  "Combler mes lacunes",
  "M'entraîner sur des annales",
  "Méthode et rédaction",
  "Gestion du stress",
] as const;

const BIRTH_YEARS = Array.from({ length: 8 }, (_, i) => String(2010 - i));
const BIRTH_MONTHS = [
  { value: "01", label: "Janvier" },
  { value: "02", label: "Février" },
  { value: "03", label: "Mars" },
  { value: "04", label: "Avril" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juin" },
  { value: "07", label: "Juillet" },
  { value: "08", label: "Août" },
  { value: "09", label: "Septembre" },
  { value: "10", label: "Octobre" },
  { value: "11", label: "Novembre" },
  { value: "12", label: "Décembre" },
];

const LANGUAGES = [
  { value: "fr" as const, label: "🇫🇷 Français" },
  { value: "darija" as const, label: "🇩🇿 Darija" },
  { value: "ar" as const, label: "📖 Arabe" },
];

type WizardState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  filiere: FullStudentSignup["filiere"];
  level: string;
  wilaya: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  phonePrefix: string;
  phone: string;
  targetScore: number | null;
  hoursPerWeek: number | null;
  focusAreas: string[];
  languagePreference: FullStudentSignup["languagePreference"];
  parentEmail: string;
  acceptTerms: boolean;
};

const INITIAL_STATE: WizardState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  filiere: "sciences_exp",
  level: "terminale",
  wilaya: "",
  birthDay: "",
  birthMonth: "",
  birthYear: "",
  phonePrefix: "+213",
  phone: "",
  targetScore: null,
  hoursPerWeek: null,
  focusAreas: [],
  languagePreference: "fr",
  parentEmail: "",
  acceptTerms: false,
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm font-medium text-coral" role="alert">
      {message}
    </p>
  );
}

function selectClassName(invalid?: boolean) {
  return cn(
    "h-10 w-full rounded-lg border bg-cream px-3 text-sm text-ink outline-none transition-colors",
    "focus-visible:border-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-800/20",
    invalid ? "border-coral" : "border-sand",
  );
}

function PasswordStrength({ password }: { password: string }) {
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

function StepIndicatorVertical({ currentStep }: { currentStep: number }) {
  return (
    <ol className="mt-10 space-y-0">
      {STEPS.map((step, index) => {
        const stepNum = index + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <li key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  isDone &&
                    "border-emerald-600 bg-emerald-600 text-cream",
                  isActive &&
                    "border-gold-500 bg-gold-500/20 text-gold-400",
                  !isDone &&
                    !isActive &&
                    "border-emerald-700/50 bg-transparent text-emerald-700/60",
                )}
              >
                {isDone ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  stepNum
                )}
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className={cn(
                    "my-1 w-0.5 flex-1 min-h-8",
                    isDone ? "bg-emerald-600" : "bg-emerald-700/40",
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-8", index === STEPS.length - 1 && "pb-0")}>
              <p
                className={cn(
                  "font-medium",
                  isActive
                    ? "text-gold-400"
                    : isDone
                      ? "text-emerald-100"
                      : "text-emerald-700/70",
                )}
              >
                {step.title}
              </p>
              <p className="text-sm text-emerald-200/70">{step.subtitle}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function MobileProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex gap-1.5 lg:hidden" aria-label="Progression">
      {STEPS.map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i + 1 <= currentStep ? "bg-emerald-800" : "bg-sand",
          )}
        />
      ))}
    </div>
  );
}

function SelectableCard({
  selected,
  onClick,
  title,
  subtitle,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border-2 p-4 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2",
        selected
          ? "border-emerald-800 bg-emerald-50 shadow-sm"
          : "border-sand bg-cream hover:border-emerald-700/40",
        className,
      )}
    >
      <p className="font-display text-lg font-semibold text-emerald-900">
        {title}
      </p>
      {subtitle ? (
        <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
      ) : null}
    </button>
  );
}

export function StudentSignupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPending, startTransition] = useTransition();

  const isMinor = useMemo(
    () => isMinorFromParts(form.birthDay, form.birthMonth, form.birthYear),
    [form.birthDay, form.birthMonth, form.birthYear],
  );

  const patch = useCallback(
    <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    },
    [],
  );

  const toggleFocusArea = (area: string) => {
    setForm((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const goNext = () => {
    setDirection(1);
    setErrors({});

    if (step === 1) {
      const result = signupStep1Schema.safeParse({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      if (!result.success) {
        setErrors(zodErrorsToMap(result.error.flatten().fieldErrors));
        return;
      }
      setForm((prev) => ({ ...prev, ...result.data }));
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!form.birthDay || !form.birthMonth || !form.birthYear) {
        setErrors({ birthdate: "Date de naissance complète requise" });
        return;
      }
      const birthdate = composeBirthdate(
        form.birthDay,
        form.birthMonth,
        form.birthYear,
      );
      const result = signupStep2Schema.safeParse({
        filiere: form.filiere,
        level: form.level,
        birthdate,
        wilaya: form.wilaya,
        phone: formatPhone(form.phonePrefix, form.phone),
      });
      if (!result.success) {
        setErrors(zodErrorsToMap(result.error.flatten().fieldErrors));
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (form.targetScore === null) {
        setErrors({ targetScore: "Choisis une note visée" });
        return;
      }
      if (form.hoursPerWeek === null) {
        setErrors({ hoursPerWeek: "Choisis ton rythme hebdomadaire" });
        return;
      }
      const result = signupStep3Schema.safeParse({
        targetScore: form.targetScore,
        hoursPerWeek: form.hoursPerWeek,
        focusAreas: form.focusAreas,
      });
      if (!result.success) {
        setErrors(zodErrorsToMap(result.error.flatten().fieldErrors));
        return;
      }
      setStep(4);
      return;
    }
  };

  const goBack = () => {
    setDirection(-1);
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const buildPayload = (): FullStudentSignup => {
    const birthdate = composeBirthdate(
      form.birthDay,
      form.birthMonth,
      form.birthYear,
    );
    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      filiere: form.filiere,
      level: form.level,
      birthdate,
      wilaya: form.wilaya,
      phone: formatPhone(form.phonePrefix, form.phone),
      targetScore: form.targetScore!,
      hoursPerWeek: form.hoursPerWeek!,
      focusAreas: form.focusAreas,
      languagePreference: form.languagePreference,
      parentEmail: form.parentEmail.trim() || undefined,
      acceptTerms: form.acceptTerms,
    };
  };

  const handleSubmit = () => {
    setErrors({});

    if (isMinor && !form.parentEmail.trim()) {
      setErrors({
        parentEmail:
          "L'email de ton parent est obligatoire pour les moins de 18 ans",
      });
      return;
    }

    const step4Result = signupStep4Schema.safeParse({
      languagePreference: form.languagePreference,
      parentEmail: form.parentEmail.trim() || "",
      acceptTerms: form.acceptTerms,
    });

    if (!step4Result.success) {
      setErrors(zodErrorsToMap(step4Result.error.flatten().fieldErrors));
      return;
    }

    startTransition(async () => {
      const result = await signupStudent(buildPayload());

      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(zodErrorsToMap(result.fieldErrors));
        }
        toast.error(result.error);
        return;
      }

      router.refresh();
      router.push(result.redirectTo);
    });
  };

  const stepTitle = STEPS[step - 1]?.title ?? "";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-12">
      {/* Sidebar émeraude — desktop */}
      <aside className="relative hidden flex-col bg-emerald-800 px-10 py-12 text-cream lg:col-span-4 lg:flex">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-800"
          aria-label="Najahy — accueil"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-900 font-display text-2xl font-semibold text-gold-500">
            ن
          </span>
          <span className="font-display text-2xl font-semibold tracking-tight text-gold-500">
            Najahy
          </span>
        </Link>
        <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-gold-400">
          Inscription Élève
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-cream">
          Quelques infos.
          <br />
          Et ton plan personnalisé.
        </h1>

        <StepIndicatorVertical currentStep={step} />

        <blockquote className="mt-auto border-l-2 border-gold-500/60 pl-4">
          <p className="font-display text-lg italic text-gold-100">
            &ldquo;J&apos;ai gagné 4 points en 2 mois&rdquo;
          </p>
          <footer className="mt-2 text-sm text-emerald-200/80">
            — Yacine, Oran
          </footer>
        </blockquote>
      </aside>

      {/* Zone formulaire */}
      <main className="flex min-h-screen flex-col lg:col-span-8">
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-8 sm:px-8 lg:py-12">
          <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
            <Logo href="/" size="sm" />
            <Link
              href="/inscription"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
            >
              Changer de rôle
            </Link>
          </div>

          <MobileProgress currentStep={step} />

          <div className="mt-6 mb-2 lg:mt-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Étape {step} sur 4
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-emerald-900 sm:text-3xl">
              {stepTitle}
            </h2>
          </div>

          <div className="relative mt-6 flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{
                  opacity: 0,
                  x: direction > 0 ? 24 : -24,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: direction > 0 ? -24 : 24,
                }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {step === 1 ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          value={form.firstName}
                          onChange={(e) => patch("firstName", e.target.value)}
                          autoComplete="given-name"
                          aria-invalid={!!errors.firstName}
                          className="h-10 border-sand bg-cream"
                        />
                        <FieldError message={errors.firstName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          value={form.lastName}
                          onChange={(e) => patch("lastName", e.target.value)}
                          autoComplete="family-name"
                          aria-invalid={!!errors.lastName}
                          className="h-10 border-sand bg-cream"
                        />
                        <FieldError message={errors.lastName} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => patch("email", e.target.value)}
                        autoComplete="email"
                        placeholder="toi@exemple.dz"
                        aria-invalid={!!errors.email}
                        className="h-10 border-sand bg-cream"
                      />
                      <FieldError message={errors.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => patch("password", e.target.value)}
                        autoComplete="new-password"
                        aria-invalid={!!errors.password}
                        className="h-10 border-sand bg-cream"
                      />
                      <PasswordStrength password={form.password} />
                      <FieldError message={errors.password} />
                    </div>
                  </>
                ) : null}

                {step === 2 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="filiere">Filière</Label>
                      <select
                        id="filiere"
                        value={form.filiere}
                        onChange={(e) =>
                          patch(
                            "filiere",
                            e.target.value as WizardState["filiere"],
                          )
                        }
                        className={selectClassName(!!errors.filiere)}
                      >
                        {FILIERES.map((f) => (
                          <option
                            key={f.value}
                            value={f.value}
                            disabled={!f.enabled}
                          >
                            {f.label}
                            {!f.enabled ? " — Bientôt" : ""}
                          </option>
                        ))}
                      </select>
                      <FieldError message={errors.filiere} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="level">Niveau</Label>
                      <select
                        id="level"
                        value={form.level}
                        onChange={(e) => patch("level", e.target.value)}
                        className={selectClassName()}
                      >
                        <option value="terminale">
                          Terminale — 3ème année secondaire
                        </option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="wilaya">Wilaya</Label>
                      <select
                        id="wilaya"
                        value={form.wilaya}
                        onChange={(e) => patch("wilaya", e.target.value)}
                        className={selectClassName(!!errors.wilaya)}
                      >
                        <option value="">Sélectionne ta wilaya</option>
                        {ALGERIAN_WILAYAS.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                        <option value={WILAYA_DIASPORA}>{WILAYA_DIASPORA}</option>
                      </select>
                      <FieldError message={errors.wilaya} />
                    </div>

                    <div className="space-y-2">
                      <Label>Date de naissance</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <select
                          value={form.birthDay}
                          onChange={(e) => patch("birthDay", e.target.value)}
                          className={selectClassName(!!errors.birthdate)}
                          aria-label="Jour"
                        >
                          <option value="">Jour</option>
                          {Array.from({ length: 31 }, (_, i) => {
                            const d = String(i + 1).padStart(2, "0");
                            return (
                              <option key={d} value={d}>
                                {i + 1}
                              </option>
                            );
                          })}
                        </select>
                        <select
                          value={form.birthMonth}
                          onChange={(e) => patch("birthMonth", e.target.value)}
                          className={selectClassName(!!errors.birthdate)}
                          aria-label="Mois"
                        >
                          <option value="">Mois</option>
                          {BIRTH_MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={form.birthYear}
                          onChange={(e) => patch("birthYear", e.target.value)}
                          className={selectClassName(!!errors.birthdate)}
                          aria-label="Année"
                        >
                          <option value="">Année</option>
                          {BIRTH_YEARS.map((y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          ))}
                        </select>
                      </div>
                      <FieldError message={errors.birthdate} />
                    </div>

                    {isMinor ? (
                      <div className="rounded-xl border border-gold-400/40 bg-gold-100 px-4 py-3 text-sm text-emerald-900">
                        💡 Tu es mineur — Tu auras besoin d&apos;un parent pour
                        valider ton compte. On te demandera son email à
                        l&apos;étape 4.
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Téléphone{" "}
                        <span className="font-normal text-muted">(optionnel)</span>
                      </Label>
                      <div className="flex gap-2">
                        <select
                          value={form.phonePrefix}
                          onChange={(e) => patch("phonePrefix", e.target.value)}
                          className={cn(selectClassName(), "w-28 shrink-0")}
                          aria-label="Indicatif"
                        >
                          <option value="+213">+213</option>
                          <option value="+33">+33</option>
                          <option value="+1">+1</option>
                        </select>
                        <Input
                          id="phone"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => patch("phone", e.target.value)}
                          placeholder="555 12 34 56"
                          className="h-10 flex-1 border-sand bg-cream"
                        />
                      </div>
                    </div>
                  </>
                ) : null}

                {step === 3 ? (
                  <>
                    <div className="space-y-3">
                      <Label>Note visée au BAC</Label>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {TARGET_SCORES.map((opt) => (
                          <SelectableCard
                            key={opt.value}
                            selected={form.targetScore === opt.value}
                            onClick={() => patch("targetScore", opt.value)}
                            title={opt.label}
                            subtitle={opt.subtitle}
                          />
                        ))}
                      </div>
                      <FieldError message={errors.targetScore} />
                    </div>

                    <div className="space-y-3">
                      <Label>Combien d&apos;heures par semaine ?</Label>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {HOURS_OPTIONS.map((opt) => (
                          <SelectableCard
                            key={opt.value}
                            selected={form.hoursPerWeek === opt.value}
                            onClick={() => patch("hoursPerWeek", opt.value)}
                            title={opt.label}
                          />
                        ))}
                      </div>
                      <FieldError message={errors.hoursPerWeek} />
                    </div>

                    <div className="space-y-3">
                      <Label>Sur quoi te concentrer ?</Label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {FOCUS_AREAS.map((area) => (
                          <SelectableCard
                            key={area}
                            selected={form.focusAreas.includes(area)}
                            onClick={() => toggleFocusArea(area)}
                            title={area}
                            className="p-3"
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : null}

                {step === 4 ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="language">Langue préférée</Label>
                      <select
                        id="language"
                        value={form.languagePreference}
                        onChange={(e) =>
                          patch(
                            "languagePreference",
                            e.target.value as WizardState["languagePreference"],
                          )
                        }
                        className={selectClassName()}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.value} value={l.value}>
                            {l.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {isMinor ? (
                      <div className="space-y-2">
                        <Label htmlFor="parentEmail">Email de ton parent</Label>
                        <Input
                          id="parentEmail"
                          type="email"
                          value={form.parentEmail}
                          onChange={(e) => patch("parentEmail", e.target.value)}
                          placeholder="parent@exemple.dz"
                          required
                          aria-invalid={!!errors.parentEmail}
                          className="h-10 border-sand bg-cream"
                        />
                        <p className="text-sm text-muted">
                          Il recevra un email pour valider ton inscription
                          (obligatoire pour les moins de 18 ans en Algérie).
                        </p>
                        <FieldError message={errors.parentEmail} />
                      </div>
                    ) : null}

                    <div className="flex items-start gap-3">
                      <input
                        id="acceptTerms"
                        type="checkbox"
                        checked={form.acceptTerms}
                        onChange={(e) => patch("acceptTerms", e.target.checked)}
                        className="mt-1 size-4 rounded border-sand accent-emerald-800"
                        aria-invalid={!!errors.acceptTerms}
                      />
                      <label
                        htmlFor="acceptTerms"
                        className="text-sm leading-relaxed text-ink"
                      >
                        J&apos;accepte les{" "}
                        <Link
                          href="/cgu"
                          className="font-medium text-emerald-800 underline-offset-2 hover:underline"
                        >
                          CGU
                        </Link>{" "}
                        et la{" "}
                        <Link
                          href="/confidentialite"
                          className="font-medium text-emerald-800 underline-offset-2 hover:underline"
                        >
                          politique de confidentialité
                        </Link>
                      </label>
                    </div>
                    <FieldError message={errors.acceptTerms} />
                  </>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-between gap-4 border-t border-sand pt-6">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={goBack}
                disabled={isPending}
                className="border-sand bg-transparent"
              >
                <ChevronLeft className="size-4" />
                Retour
              </Button>
            ) : (
              <Link
                href="/inscription"
                className="text-sm font-medium text-muted hover:text-emerald-800"
              >
                ← Changer de rôle
              </Link>
            )}

            {step < 4 ? (
              <Button
                type="button"
                onClick={goNext}
                className="ml-auto bg-emerald-800 text-cream hover:bg-emerald-900"
              >
                Continuer
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="ml-auto min-w-[180px] bg-emerald-800 text-cream hover:bg-emerald-900"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Création…
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
