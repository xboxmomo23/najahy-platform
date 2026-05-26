/**
 * Calcul du diagnostic Najahy — 20 QCM (5 par matière), score de maîtrise
 * et prédiction BAC pondérée par les coefficients officiels.
 */

export interface SubjectScore {
  subjectSlug: string;
  subjectName: string;
  coefficient: number;
  /** Part des points pondérés (difficulté) obtenus sur le maximum possible, 0–100 */
  masteryPercentage: number;
  correctCount: number;
  totalCount: number;
  /** Chapitres où au moins une réponse est incorrecte (ordre de première erreur) */
  weakChapters: string[];
  tone: "force" | "solid" | "consolidate" | "priority";
}

export interface DiagnosticPriority {
  subjectSlug: string;
  chapterSlug: string;
  chapterTitle: string;
  /** Gain estimé sur la note prédictive /20 si la maîtrise atteint ~70 % */
  potentialGain: number;
}

export interface DiagnosticResult {
  subjectScores: SubjectScore[];
  /** Note BAC estimée /20, pondérée par les coefficients */
  predictedScore: number;
  targetScore: number;
  /** Écart à combler : targetScore − predictedScore */
  gap: number;
  topPriorities: DiagnosticPriority[];
  firstStep: {
    chapterSlug: string;
    chapterTitle: string;
    reason: string;
  };
}

export type DiagnosticAnswer = {
  questionId: string;
  subjectSlug: string;
  /** 1 = facile, 2 = moyen, 3 = difficile */
  difficulty: number;
  isCorrect: boolean;
  chapterSlug: string;
};

export type DiagnosticSubject = {
  slug: string;
  name: string;
  coefficient: number;
};

/** Points attribués à une bonne réponse selon la difficulté (récompense la maîtrise des items difficiles). */
function pointsForDifficulty(difficulty: number): number {
  switch (difficulty) {
    case 1:
      return 1;
    case 2:
      return 1.5;
    case 3:
      return 2;
    default:
      // Valeur neutre si donnée inattendue — évite de casser le calcul
      return 1;
  }
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Badge pédagogique : traduit le % de maîtrise en message actionnable pour l'élève. */
export function getToneForMastery(
  masteryPercentage: number,
): SubjectScore["tone"] {
  if (masteryPercentage >= 70) return "force";
  if (masteryPercentage >= 60) return "solid";
  if (masteryPercentage >= 45) return "consolidate";
  return "priority";
}

/**
 * Score de maîtrise d'une matière : ratio points obtenus / points max possibles.
 * On pondère par la difficulté pour ne pas traiter toutes les questions à égalité.
 */
export function computeMasteryPercentage(
  subjectAnswers: DiagnosticAnswer[],
): { masteryPercentage: number; correctCount: number; totalCount: number } {
  const totalCount = subjectAnswers.length;

  if (totalCount === 0) {
    return { masteryPercentage: 0, correctCount: 0, totalCount: 0 };
  }

  let earnedPoints = 0;
  let maxPoints = 0;
  let correctCount = 0;

  for (const answer of subjectAnswers) {
    const weight = pointsForDifficulty(answer.difficulty);
    maxPoints += weight;
    if (answer.isCorrect) {
      earnedPoints += weight;
      correctCount += 1;
    }
  }

  const masteryPercentage = Math.round((earnedPoints / maxPoints) * 100);

  return { masteryPercentage, correctCount, totalCount };
}

/** Chapitres faibles : première occurrence de chaque chapitre avec au moins une erreur. */
function collectWeakChapters(subjectAnswers: DiagnosticAnswer[]): string[] {
  const seen = new Set<string>();
  const weak: string[] = [];

  for (const answer of subjectAnswers) {
    if (!answer.isCorrect && !seen.has(answer.chapterSlug)) {
      seen.add(answer.chapterSlug);
      weak.push(answer.chapterSlug);
    }
  }

  return weak;
}

/**
 * Note prédictive /20 : moyenne des notes par matière (maîtrise → /20)
 * pondérée par les coefficients BAC (une matière à coef 7 pèse plus qu'une à coef 2).
 */
export function computePredictedScore(
  subjectScores: Pick<SubjectScore, "masteryPercentage" | "coefficient">[],
): number {
  const coefficientSum = subjectScores.reduce(
    (sum, s) => sum + s.coefficient,
    0,
  );

  if (coefficientSum === 0) return 0;

  const weightedSum = subjectScores.reduce((sum, s) => {
    const scoreOn20 = (s.masteryPercentage * 20) / 100;
    return sum + scoreOn20 * s.coefficient;
  }, 0);

  return roundToOneDecimal(weightedSum / coefficientSum);
}

/**
 * Priorité d'une matière : faible maîtrise + fort coefficient = urgence élevée.
 * (100 − mastery) × coefficient classe les matières à fort impact BAC en tête.
 */
export function computeSubjectPriority(
  masteryPercentage: number,
  coefficient: number,
): number {
  return (100 - masteryPercentage) * coefficient;
}

/**
 * Gain potentiel sur la note globale si la maîtrise de cette matière monte vers ~70 %.
 * Formule alignée sur la pondération coefficients du predictedScore.
 */
export function computePotentialGain(
  masteryPercentage: number,
  coefficient: number,
  coefficientSum: number,
): number {
  if (coefficientSum === 0) return 0;

  const gain =
    ((70 - masteryPercentage) / 100) * coefficient * (20 / coefficientSum);

  return roundToOneDecimal(gain);
}

/** Affichage lisible quand le titre chapitre n'est pas fourni par la BDD. */
export function slugToChapterTitle(chapterSlug: string): string {
  return chapterSlug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildSubjectScore(
  subject: DiagnosticSubject,
  subjectAnswers: DiagnosticAnswer[],
): SubjectScore {
  const { masteryPercentage, correctCount, totalCount } =
    computeMasteryPercentage(subjectAnswers);

  return {
    subjectSlug: subject.slug,
    subjectName: subject.name,
    coefficient: subject.coefficient,
    masteryPercentage,
    correctCount,
    totalCount,
    weakChapters: collectWeakChapters(subjectAnswers),
    tone: getToneForMastery(masteryPercentage),
  };
}

function buildTopPriorities(
  subjectScores: SubjectScore[],
  coefficientSum: number,
): DiagnosticPriority[] {
  const ranked = [...subjectScores]
    .map((s) => ({
      subject: s,
      priority: computeSubjectPriority(s.masteryPercentage, s.coefficient),
    }))
    .sort((a, b) => b.priority - a.priority);

  const priorities: DiagnosticPriority[] = [];

  for (const { subject } of ranked) {
    if (priorities.length >= 3) break;

    const chapterSlug = subject.weakChapters[0];
    if (!chapterSlug) continue;

    priorities.push({
      subjectSlug: subject.subjectSlug,
      chapterSlug,
      chapterTitle: slugToChapterTitle(chapterSlug),
      potentialGain: computePotentialGain(
        subject.masteryPercentage,
        subject.coefficient,
        coefficientSum,
      ),
    });
  }

  return priorities;
}

function buildFirstStep(
  subjectScores: SubjectScore[],
): DiagnosticResult["firstStep"] {
  const ranked = [...subjectScores].sort((a, b) => {
    const priorityA = computeSubjectPriority(
      a.masteryPercentage,
      a.coefficient,
    );
    const priorityB = computeSubjectPriority(
      b.masteryPercentage,
      b.coefficient,
    );
    return priorityB - priorityA;
  });

  const top = ranked[0];
  const chapterSlug =
    top?.weakChapters[0] ?? ranked.find((s) => s.weakChapters[0])?.weakChapters[0] ?? "revision";

  const subjectForStep =
    ranked.find((s) => s.weakChapters.includes(chapterSlug)) ?? top;

  const chapterTitle = slugToChapterTitle(chapterSlug);
  const subjectName = subjectForStep?.subjectName ?? "cette matière";

  return {
    chapterSlug,
    chapterTitle,
    reason: `C'est ton point faible en ${subjectName}, et c'est une compétence clé du BAC.`,
  };
}

/**
 * Agrège les réponses du diagnostic en résultat complet (scores, prédiction, priorités).
 */
export function computeDiagnosticResult(
  answers: DiagnosticAnswer[],
  subjects: DiagnosticSubject[],
  targetScore: number,
): DiagnosticResult {
  const subjectScores = subjects.map((subject) => {
    const subjectAnswers = answers.filter(
      (a) => a.subjectSlug === subject.slug,
    );
    return buildSubjectScore(subject, subjectAnswers);
  });

  const coefficientSum = subjects.reduce((sum, s) => sum + s.coefficient, 0);
  const predictedScore = computePredictedScore(subjectScores);
  const gap = roundToOneDecimal(targetScore - predictedScore);
  const topPriorities = buildTopPriorities(subjectScores, coefficientSum);
  const firstStep = buildFirstStep(subjectScores);

  return {
    subjectScores,
    predictedScore,
    targetScore,
    gap,
    topPriorities,
    firstStep,
  };
}
