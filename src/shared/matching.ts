import type { Mentor, Profil, Recommandation, Seance } from "./types";
import { domaineNom } from "./data";

const normaliser = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Note moyenne d'un mentor à partir des séances évaluées. */
export function noteMoyenne(mentorId: string, seances: Seance[]) {
  const notes = seances.filter((s) => s.mentorId === mentorId && s.note).map((s) => s.note!);
  if (notes.length === 0) return null;
  return notes.reduce((a, b) => a + b, 0) / notes.length;
}

/**
 * Score de compatibilité local (sans IA) entre un profil et un mentor :
 * domaines communs, compétences communes, mots-clés des besoins, ville et note.
 */
export function scoreCompatibilite(profil: Profil, mentor: Mentor, seances: Seance[] = []): Recommandation {
  let score = 0;
  const raisons: string[] = [];

  const domainesCommuns = mentor.domaines.filter((d) => profil.domaines.includes(d));
  score += domainesCommuns.length * 30;
  if (domainesCommuns.length) raisons.push(`expert en ${domainesCommuns.map(domaineNom).join(" et ")}`);

  const competencesProfil = profil.competences.map(normaliser);
  const competencesCommunes = mentor.competences.filter((c) => competencesProfil.includes(normaliser(c)));
  score += competencesCommunes.length * 15;
  if (competencesCommunes.length) raisons.push(`maîtrise ${competencesCommunes.join(", ")}`);

  const besoins = normaliser(profil.besoins);
  const motsCles = mentor.competences.filter((c) => besoins.includes(normaliser(c)));
  score += motsCles.length * 10;

  if (mentor.ville === profil.ville) {
    score += 10;
    raisons.push(`basé(e) à ${mentor.ville}`);
  }

  const note = noteMoyenne(mentor.id, seances);
  if (note) score += note * 2;
  score += Math.min(mentor.experience, 15);

  return {
    mentorId: mentor.id,
    score: Math.min(100, Math.round(score)),
    raison: raisons.length ? capitaliser(raisons.join(", ")) + "." : "Profil complémentaire pour élargir vos horizons.",
  };
}

export function recommanderLocalement(profil: Profil, mentors: Mentor[], seances: Seance[] = []) {
  return mentors
    .map((m) => scoreCompatibilite(profil, m, seances))
    .sort((a, b) => b.score - a.score);
}

function capitaliser(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
