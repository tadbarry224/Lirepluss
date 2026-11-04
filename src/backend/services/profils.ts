import "server-only";
import type { Profil } from "@/shared/types";
import { supabaseAdmin } from "../db/supabase-admin";

/**
 * Seul point d'écriture des profils en mode Supabase : les règles RLS interdisent
 * aux navigateurs de modifier la table directement, tout passe par ce service après validation.
 */

const BUCKET_PHOTOS = "avatars";

/** Profil validé → colonnes de la table profiles. */
function versColonnes(p: Profil) {
  const mentor = p.role === "mentor";
  return {
    nom: p.nom,
    role: p.role,
    ville: p.ville,
    niveau: p.niveau,
    domaines: p.domaines,
    competences: p.competences,
    besoins: p.besoins,
    attentes: p.attentes ?? [],
    format_prefere: p.formatPrefere ?? null,
    langues: p.langues ?? ["Français"],
    // Champs propres aux mentors : effacés si la personne redevient mentorée
    titre: mentor ? p.titre || null : null,
    organisation: mentor ? p.organisation || null : null,
    experience: mentor ? (p.experience ?? null) : null,
    disponibilites: mentor ? (p.disponibilites ?? []) : [],
    charte_acceptee: mentor ? Boolean(p.charteAcceptee) : false,
  };
}

export async function enregistrerProfil(userId: string, profil: Profil) {
  const { data, error } = await supabaseAdmin()
    .from("profiles")
    .update(versColonnes(profil))
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw new Error(`Enregistrement du profil impossible : ${error.message}`);
  return data;
}

export async function enregistrerPhoto(userId: string, octets: Uint8Array, type: string, extension: string) {
  const sb = supabaseAdmin();
  const chemin = `${userId}/photo-${Date.now()}.${extension}`;
  const envoi = await sb.storage.from(BUCKET_PHOTOS).upload(chemin, octets, { contentType: type, upsert: false });
  if (envoi.error) throw new Error(`Envoi de la photo impossible : ${envoi.error.message}`);
  const url = sb.storage.from(BUCKET_PHOTOS).getPublicUrl(chemin).data.publicUrl;

  const { data: ancien } = await sb.from("profiles").select("photo_url").eq("user_id", userId).single();
  const { data, error } = await sb.from("profiles").update({ photo_url: url }).eq("user_id", userId).select().single();
  if (error) throw new Error(`Enregistrement de la photo impossible : ${error.message}`);

  // Supprime l'ancienne photo pour ne pas accumuler de fichiers
  const ancienChemin = ancien?.photo_url?.split(`/${BUCKET_PHOTOS}/`)[1];
  if (ancienChemin) await sb.storage.from(BUCKET_PHOTOS).remove([ancienChemin]);
  return data;
}
