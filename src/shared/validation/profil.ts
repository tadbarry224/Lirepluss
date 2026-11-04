import { z } from "zod";
import { attentesProgramme, domaines } from "../data";
import { profilsBeneficiaires, type Profil } from "../types";

/**
 * Règles de validation d'un profil, partagées par :
 *  - le frontend, pour afficher les erreurs immédiatement ;
 *  - le backend (/api/profil), qui les applique de façon définitive avant tout enregistrement.
 */

export const FORMAT_DISPONIBILITE = /^(Lun|Mar|Mer|Jeu|Ven|Sam|Dim) ([01]\d|2[0-3]):[0-5]\d$/;
export const TAILLE_MAX_PHOTO_ENCODEE = 400_000; // ~300 Ko une fois décodée

const idsDomaines = domaines.map((d) => d.id) as [string, ...string[]];
const idsAttentes = attentesProgramme.map((a) => a.id) as [string, ...string[]];

const photo = z
  .string()
  .max(TAILLE_MAX_PHOTO_ENCODEE, "Photo trop lourde")
  .refine((v) => /^data:image\/(jpeg|png|webp);base64,/.test(v) || v.startsWith("https://"), "Photo invalide");

export const schemaProfil = z
  .object({
    nom: z.string().trim().min(2, "Indiquez votre nom (2 caractères minimum)").max(80, "Nom trop long (80 caractères maximum)"),
    role: z.enum(["mentore", "mentor"], { error: "Rôle invalide" }),
    ville: z.string().trim().min(2, "Indiquez votre ville").max(60, "Nom de ville trop long"),
    niveau: z.enum(profilsBeneficiaires, { error: "Choisissez votre profil dans la liste" }),
    domaines: z
      .array(z.enum(idsDomaines, { error: "Domaine inconnu" }))
      .min(1, "Choisissez au moins un domaine")
      .max(idsDomaines.length),
    competences: z
      .array(z.string().trim().min(1).max(60, "Une compétence ne doit pas dépasser 60 caractères"))
      .max(15, "15 compétences maximum"),
    besoins: z.string().trim().max(1000, "Texte trop long (1000 caractères maximum)"),
    attentes: z.array(z.enum(idsAttentes, { error: "Attente inconnue" })).max(idsAttentes.length).default([]),
    formatPrefere: z.enum(["Visio", "Chat", "Présentiel"], { error: "Format invalide" }).optional(),
    charteAcceptee: z.boolean().default(false),
    photo: photo.optional(),
    titre: z.string().trim().max(100, "Poste trop long (100 caractères maximum)").optional(),
    organisation: z.string().trim().max(100, "Organisation trop longue (100 caractères maximum)").optional(),
    experience: z.number({ error: "Indiquez un nombre d'années" }).int("Nombre entier attendu").min(0).max(60, "60 ans maximum").optional(),
    langues: z.array(z.string().trim().min(1).max(30, "Langue trop longue")).max(6, "6 langues maximum").default(["Français"]),
    disponibilites: z
      .array(z.string().trim().regex(FORMAT_DISPONIBILITE, "Disponibilité invalide : utilisez le format « Lun 18:00 »"))
      .max(14, "14 créneaux maximum")
      .default([]),
  });

export type ErreursProfil = Partial<Record<keyof Profil | string, string>>;

export type ResultatValidation = { ok: true; profil: Profil } | { ok: false; erreurs: ErreursProfil };

/**
 * Règles qui dépendent du rôle (TDR §9 pour les mentors). Elles sont vérifiées même si d'autres champs
 * sont faux, pour que l'utilisateur voie toutes ses erreurs en une seule fois.
 */
function reglesSelonLeRole(d: Record<string, unknown>): ErreursProfil {
  const erreurs: ErreursProfil = {};
  const texte = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const nombre = (v: unknown) => (Array.isArray(v) ? v.filter((x) => texte(x)).length : 0);
  const besoins = texte(d.besoins).length;

  if (d.role !== "mentor") {
    if (besoins < 10) erreurs.besoins = "Décrivez vos besoins en quelques mots (10 caractères minimum)";
    return erreurs;
  }
  if (besoins < 30) erreurs.besoins = "Présentez votre parcours (30 caractères minimum)";
  if (texte(d.titre).length < 2) erreurs.titre = "Indiquez votre poste";
  if (typeof d.experience !== "number" || d.experience < 1) erreurs.experience = "Indiquez vos années d'expérience (1 minimum)";
  if (nombre(d.competences) === 0) erreurs.competences = "Indiquez au moins une compétence à transmettre";
  if (d.langues !== undefined && nombre(d.langues) === 0) erreurs.langues = "Indiquez au moins une langue";
  if (nombre(d.disponibilites) === 0) erreurs.disponibilites = "Indiquez au moins une disponibilité";
  if (d.charteAcceptee !== true) erreurs.charteAcceptee = "La charte d'engagement doit être acceptée";
  return erreurs;
}

/** Valide et normalise un profil (espaces superflus retirés, valeurs par défaut). */
export function validerProfil(donnees: unknown): ResultatValidation {
  if (typeof donnees !== "object" || donnees === null) return { ok: false, erreurs: { formulaire: "Profil manquant" } };
  const r = schemaProfil.safeParse(donnees);
  const erreurs: ErreursProfil = {};
  if (!r.success) {
    for (const issue of r.error.issues) erreurs[String(issue.path[0] ?? "formulaire")] ??= issue.message;
  }
  // Les erreurs de format (schéma) priment sur celles liées au rôle pour un même champ
  for (const [champ, message] of Object.entries(reglesSelonLeRole(donnees as Record<string, unknown>))) erreurs[champ] ??= message;

  if (r.success && Object.keys(erreurs).length === 0) return { ok: true, profil: r.data as Profil };
  return { ok: false, erreurs };
}
