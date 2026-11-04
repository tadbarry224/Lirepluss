import { z } from "zod";

/** Règles d'une demande de mentorat, appliquées dans le navigateur puis par POST /api/demandes. */
export const schemaDemande = z.object({
  mentorId: z.string().trim().min(1, "Mentor manquant").max(64),
  objectif: z.string().trim().min(5, "Précisez votre objectif (5 caractères minimum)").max(150, "Objectif trop long (150 caractères maximum)"),
  message: z
    .string()
    .trim()
    .min(20, "Présentez-vous et expliquez votre demande (20 caractères minimum)")
    .max(1000, "Message trop long (1000 caractères maximum)"),
});

/** Réponse du mentor à une demande (PATCH /api/demandes/[id]). */
export const schemaReponse = z.object({
  statut: z.enum(["acceptee", "refusee"], { error: "Réponse invalide" }),
  reponse: z.string().trim().max(500, "Réponse trop longue (500 caractères maximum)").default(""),
});

export type Demande = z.infer<typeof schemaDemande>;
export type ErreursDemande = Partial<Record<keyof Demande | "formulaire", string>>;

export function validerDemande(donnees: unknown): { ok: true; demande: Demande } | { ok: false; erreurs: ErreursDemande } {
  const r = schemaDemande.safeParse(donnees);
  if (r.success) return { ok: true, demande: r.data };
  const erreurs: ErreursDemande = {};
  for (const issue of r.error.issues) erreurs[(issue.path[0] as keyof Demande) ?? "formulaire"] ??= issue.message;
  return { ok: false, erreurs };
}
