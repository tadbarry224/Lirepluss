import { domaineNom, mentors as mentorsDemo } from "./data";
import type { Mentor } from "./types";

const texte = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const liste = (v: unknown, max: number) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, max).map((x) => x.slice(0, 80)) : [];

/**
 * Catalogue de mentors envoyé par le client (mentors réellement inscrits en mode Supabase),
 * nettoyé et limité. À défaut, les mentors de démonstration.
 */
export function mentorsDepuisRequete(brut: unknown): Mentor[] {
  if (!Array.isArray(brut) || brut.length === 0) return mentorsDemo;
  const propres = brut
    .slice(0, 60)
    .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null && typeof m.id === "string")
    .map((m) => ({
      id: texte(m.id, 64),
      nom: texte(m.nom, 80),
      titre: texte(m.titre, 120),
      organisation: texte(m.organisation, 120),
      ville: texte(m.ville, 60),
      domaines: liste(m.domaines, 10),
      competences: liste(m.competences, 15),
      bio: texte(m.bio, 400),
      experience: typeof m.experience === "number" ? m.experience : 0,
      langues: liste(m.langues, 6),
      disponibilites: [],
      couleur: "",
    }));
  return propres.length ? propres : mentorsDemo;
}

export function catalogue(mentors: Mentor[]) {
  return mentors
    .map(
      (m) =>
        `- id=${m.id} | ${m.nom}, ${m.titre}${m.organisation ? ` (${m.organisation})` : ""}, ${m.ville} | domaines : ${m.domaines.map(domaineNom).join(", ")} | compétences : ${m.competences.join(", ")} | ${m.experience} ans | langues : ${m.langues.join(", ")} | ${m.bio}`,
    )
    .join("\n");
}
