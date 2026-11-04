import { modeSupabase } from "@/backend/db/supabase-admin";
import { utilisateurDepuisRequete } from "@/backend/services/auth";
import { enregistrerProfil } from "@/backend/services/profils";
import { validerProfil } from "@/shared/validation/profil";

/**
 * PUT /api/profil : valide puis enregistre le profil de l'utilisateur connecté.
 *  - 400 + { erreurs: { champ: message } } si le profil est invalide ;
 *  - mode Supabase : 401 sans connexion, renvoie la ligne enregistrée ;
 *  - mode démo : renvoie le profil validé (le navigateur le conserve).
 */
export async function PUT(req: Request) {
  let donnees: unknown;
  try {
    donnees = await req.json();
  } catch {
    return Response.json({ erreurs: { formulaire: "Requête invalide" } }, { status: 400 });
  }

  const resultat = validerProfil(donnees);
  if (!resultat.ok) return Response.json({ erreurs: resultat.erreurs }, { status: 400 });

  if (!modeSupabase) return Response.json({ profil: resultat.profil });

  try {
    const utilisateur = await utilisateurDepuisRequete(req);
    if (!utilisateur) return Response.json({ erreurs: { formulaire: "Session expirée : reconnectez-vous" } }, { status: 401 });
    const ligne = await enregistrerProfil(utilisateur.id, resultat.profil);
    return Response.json({ ligne });
  } catch (e) {
    console.error(e);
    return Response.json({ erreurs: { formulaire: "Erreur du serveur, réessayez dans un instant" } }, { status: 500 });
  }
}
