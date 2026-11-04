import { modeSupabase } from "@/backend/db/supabase-admin";
import { utilisateurDepuisRequete } from "@/backend/services/auth";
import { creerDemande } from "@/backend/services/demandes";
import { reponseErreur } from "@/backend/services/erreurs";
import { validerDemande } from "@/shared/validation/demande";

/**
 * POST /api/demandes : un mentoré demande à être accompagné par un mentor.
 *  - 400 + { erreurs } si la demande est invalide ; 409 si une demande existe déjà ;
 *  - mode Supabase : renvoie la ligne créée ; mode démo : renvoie la demande validée.
 */
export async function POST(req: Request) {
  let donnees: unknown;
  try {
    donnees = await req.json();
  } catch {
    return Response.json({ erreurs: { formulaire: "Requête invalide" } }, { status: 400 });
  }
  const resultat = validerDemande(donnees);
  if (!resultat.ok) return Response.json({ erreurs: resultat.erreurs }, { status: 400 });

  if (!modeSupabase) return Response.json({ demande: resultat.demande });

  try {
    const utilisateur = await utilisateurDepuisRequete(req);
    if (!utilisateur) return Response.json({ erreurs: { formulaire: "Session expirée : reconnectez-vous" } }, { status: 401 });
    return Response.json({ ligne: await creerDemande(utilisateur.id, resultat.demande) });
  } catch (e) {
    return reponseErreur(e);
  }
}
