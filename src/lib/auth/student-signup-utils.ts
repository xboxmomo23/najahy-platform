/** Compose une date ISO (YYYY-MM-DD) à partir des selects jour/mois/année */
export function composeBirthdate(
  day: string,
  month: string,
  year: string,
): string {
  const d = day.padStart(2, "0");
  const m = month.padStart(2, "0");
  return `${year}-${m}-${d}`;
}

/** Mineur si la naissance est après (aujourd'hui − 18 ans) */
export function isMinorFromBirthdate(birthdate: string): boolean {
  const birth = new Date(birthdate);
  const adultThreshold = new Date();
  adultThreshold.setFullYear(adultThreshold.getFullYear() - 18);
  return birth > adultThreshold;
}

export function isMinorFromParts(
  day: string,
  month: string,
  year: string,
): boolean {
  if (!day || !month || !year) return false;
  return isMinorFromBirthdate(composeBirthdate(day, month, year));
}

export function formatPhone(prefix: string, local: string): string | undefined {
  const digits = local.replace(/\D/g, "");
  if (!digits) return undefined;
  const p = prefix.startsWith("+") ? prefix : `+${prefix}`;
  return `${p}${digits}`;
}

/** Extrait le premier message par champ depuis une ZodError */
export function zodErrorsToMap(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) map[key] = messages[0];
  }
  return map;
}
