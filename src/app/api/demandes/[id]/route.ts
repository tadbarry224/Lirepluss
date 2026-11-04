import { modeSupabase } from "@/backend/db/supabase-admin";
import { utilisateurDepuisRequete } from "@/backend/services/auth";
import { repondreDemande } from "@/backend/services/demandes";
import { reponseErreur } from "@/backend/services/erreurs";
import { schemaReponse } from "@/shared/validation/demande";

/** PATCH /api/demandes/[id] : le mentor accepte ou refuse une demande, avec un mot de réponse. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let donnees: unknown;
  try {
    donnees = await req.json();
  } catch {
    return Response.json({ erreurs: { formulaire: "Requête invalide" } }, { status: 400 });
  }
  const r = schemaReponse.safeParse(donnees);
  if (!r.success) return Response.json({ erreurs: { formulaire: r.error.issues[0]?.message ?? "Réponse invalide" } }, { status: 400 });

  if (!modeSupabase) return Response.json({ reponse: r.data });

  try {
    const utilisateur = await utilisateurDepuisRequete(req);
    if (!utilisateur) return Response.json({ erreurs: { formulaire: "Session expirée : reconnectez-vous" } }, { status: 401 });
    return Response.json({ ligne: await repondreDemande(utilisateur.id, id, r.data.statut, r.data.reponse) });
  } catch (e) {
    return reponseErreur(e);
  }
}
