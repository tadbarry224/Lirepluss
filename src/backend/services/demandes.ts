import "server-only";
import type { Demande } from "@/shared/validation/demande";
import { supabaseAdmin } from "../db/supabase-admin";
import { REPONSE_AUTOMATIQUE } from "@/shared/data";
import { ErreurMetier } from "./erreurs";

/**
 * Mise en relation (TDR §10, étape 3). Seul le backend crée et modifie les demandes :
 * les règles RLS n'autorisent aux navigateurs que la lecture de leurs propres demandes.
 */

async function monProfil(userId: string) {
  const { data, error } = await supabaseAdmin().from("profiles").select("id, role").eq("user_id", userId).single();
  if (error || !data) throw new ErreurMetier("Profil introuvable", 404);
  return data as { id: string; role: string };
}

export async function creerDemande(userId: string, demande: Demande) {
  const sb = supabaseAdmin();
  const moi = await monProfil(userId);
  if (moi.id === demande.mentorId) throw new ErreurMetier("Vous ne pouvez pas vous envoyer une demande à vous-même");

  const { data: mentor } = await sb.from("profiles").select("id, role, user_id").eq("id", demande.mentorId).maybeSingle();
  if (!mentor || mentor.role !== "mentor") throw new ErreurMetier("Ce mentor n'existe pas ou n'accepte pas de demandes", 404);

  const { data: existante } = await sb
    .from("demandes_mentorat")
    .select("statut")
    .eq("mentor_id", mentor.id)
    .eq("mentore_id", moi.id)
    .in("statut", ["en_attente", "acceptee"])
    .maybeSingle();
  if (existante) {
    throw new ErreurMetier(existante.statut === "acceptee" ? "Ce mentor vous accompagne déjà" : "Une demande est déjà en attente auprès de ce mentor", 409);
  }

  // Les mentors de démonstration (sans compte) acceptent automatiquement pour que la démo reste fluide.
  const automatique = mentor.user_id === null;
  const { data, error } = await sb
    .from("demandes_mentorat")
    .insert({
      mentor_id: mentor.id,
      mentore_id: moi.id,
      objectif: demande.objectif,
      message: demande.message,
      ...(automatique ? { statut: "acceptee", reponse: REPONSE_AUTOMATIQUE, repondu_at: new Date().toISOString() } : {}),
    })
    .select()
    .single();
  if (error) throw new Error(`Création de la demande impossible : ${error.message}`);
  return data;
}

export async function repondreDemande(userId: string, demandeId: string, statut: "acceptee" | "refusee", reponse: string) {
  const sb = supabaseAdmin();
  const moi = await monProfil(userId);
  const { data: demande } = await sb.from("demandes_mentorat").select("mentor_id, statut").eq("id", demandeId).maybeSingle();
  if (!demande) throw new ErreurMetier("Demande introuvable", 404);
  if (demande.mentor_id !== moi.id) throw new ErreurMetier("Seul le mentor concerné peut répondre à cette demande", 403);
  if (demande.statut !== "en_attente") throw new ErreurMetier("Cette demande a déjà reçu une réponse", 409);

  const { data, error } = await sb
    .from("demandes_mentorat")
    .update({ statut, reponse: reponse || null, repondu_at: new Date().toISOString() })
    .eq("id", demandeId)
    .select()
    .single();
  if (error) throw new Error(`Réponse impossible : ${error.message}`);
  return data;
}
