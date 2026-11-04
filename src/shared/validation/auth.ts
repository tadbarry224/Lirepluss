import { z } from "zod";

/** Règles des formulaires de connexion, d'inscription et de réinitialisation du mot de passe. */

const email = z.string().trim().toLowerCase().pipe(z.email({ error: "Adresse email invalide" }));

export const motDePasseSolide = z
  .string()
  .min(8, "8 caractères minimum")
  .max(72, "72 caractères maximum")
  .regex(/[A-Za-zÀ-ÿ]/, "Au moins une lettre")
  .regex(/\d/, "Au moins un chiffre");

export const schemaConnexion = z.object({
  email,
  motDePasse: z.string().min(1, "Saisissez votre mot de passe"),
});

export const schemaInscription = z
  .object({
    nom: z.string().trim().min(2, "Indiquez votre nom (2 caractères minimum)").max(80, "Nom trop long"),
    role: z.enum(["mentore", "mentor"], { error: "Choisissez votre rôle" }),
    email,
    motDePasse: motDePasseSolide,
    confirmation: z.string(),
  })
  .refine((d) => d.motDePasse === d.confirmation, { path: ["confirmation"], message: "Les deux mots de passe ne correspondent pas" });

export const schemaOubli = z.object({ email });

export const schemaNouveauMotDePasse = z
  .object({ motDePasse: motDePasseSolide, confirmation: z.string() })
  .refine((d) => d.motDePasse === d.confirmation, { path: ["confirmation"], message: "Les deux mots de passe ne correspondent pas" });

export type Erreurs = Record<string, string>;

/** Valide des données avec un schéma et renvoie soit les données nettoyées, soit une erreur par champ. */
export function valider<T>(schema: z.ZodType<T>, donnees: unknown): { ok: true; donnees: T } | { ok: false; erreurs: Erreurs } {
  const r = schema.safeParse(donnees);
  if (r.success) return { ok: true, donnees: r.data };
  const erreurs: Erreurs = {};
  for (const issue of r.error.issues) erreurs[String(issue.path[0] ?? "formulaire")] ??= issue.message;
  return { ok: false, erreurs };
}

/** Solidité indicative d'un mot de passe, de 0 (vide) à 4 (très solide). */
export function soliditeMotDePasse(mdp: string): 0 | 1 | 2 | 3 | 4 {
  if (!mdp) return 0;
  let score = 0;
  if (mdp.length >= 8) score++;
  if (mdp.length >= 12) score++;
  if (/[A-Za-zÀ-ÿ]/.test(mdp) && /\d/.test(mdp)) score++; // lettres et chiffres : le minimum requis
  if (/[a-zà-ÿ]/.test(mdp) && /[A-ZÀ-Ý]/.test(mdp)) score++; // minuscules et majuscules
  if (/[^A-Za-zÀ-ÿ0-9]/.test(mdp)) score++; // caractère spécial
  return Math.min(4, Math.max(1, score)) as 1 | 2 | 3 | 4;
}

/** Traduit les erreurs d'authentification de Supabase en messages compréhensibles. */
export function messageErreurAuth(erreur: { code?: string; message: string; status?: number }): string {
  const parCode: Record<string, string> = {
    invalid_credentials: "Email ou mot de passe incorrect.",
    user_already_exists: "Un compte existe déjà avec cet email : connectez-vous.",
    email_exists: "Un compte existe déjà avec cet email : connectez-vous.",
    email_not_confirmed: "Confirmez votre adresse email (lien reçu par mail) avant de vous connecter.",
    weak_password: "Mot de passe trop faible : choisissez-en un plus long et plus varié.",
    same_password: "Le nouveau mot de passe doit être différent de l'ancien.",
    over_email_send_rate_limit: "Trop d'emails envoyés : patientez quelques minutes avant de réessayer.",
    over_request_rate_limit: "Trop de tentatives : patientez quelques minutes avant de réessayer.",
    email_address_invalid: "Cette adresse email n'est pas acceptée.",
    signup_disabled: "Les inscriptions sont fermées pour le moment.",
    session_not_found: "Le lien a expiré : demandez un nouveau lien de réinitialisation.",
  };
  if (erreur.code && parCode[erreur.code]) return parCode[erreur.code];
  if (/fetch|network/i.test(erreur.message)) return "Connexion impossible : vérifiez votre accès à internet.";
  if (erreur.status === 429) return parCode.over_request_rate_limit;
  return "Une erreur est survenue, réessayez dans un instant.";
}
