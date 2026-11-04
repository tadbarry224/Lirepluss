import { modeSupabase } from "@/backend/db/supabase-admin";
import { utilisateurDepuisRequete } from "@/backend/services/auth";
import { enregistrerPhoto } from "@/backend/services/profils";
import { validerPhoto } from "@/backend/validation/photo";
import { TAILLE_MAX_PHOTO_ENCODEE } from "@/shared/validation/profil";

/**
 * POST /api/profil/photo (multipart, champ "photo") : vérifie la photo (taille, vrai format d'image) puis
 *  - mode Supabase : l'envoie dans le stockage et l'associe au profil, renvoie la ligne mise à jour ;
 *  - mode démo : renvoie l'image encodée, que le navigateur conserve.
 */
export async function POST(req: Request) {
  let fichier: unknown;
  try {
    fichier = (await req.formData()).get("photo");
  } catch {
    return Response.json({ erreur: "Requête invalide" }, { status: 400 });
  }

  const photo = await validerPhoto(fichier);
  if (!photo.ok) return Response.json({ erreur: photo.erreur }, { status: 400 });

  if (!modeSupabase) {
    const encodee = `data:${photo.type};base64,${Buffer.from(photo.octets).toString("base64")}`;
    if (encodee.length > TAILLE_MAX_PHOTO_ENCODEE) return Response.json({ erreur: "Photo trop lourde pour le mode démo (300 Ko maximum)" }, { status: 400 });
    return Response.json({ photo: encodee });
  }

  try {
    const utilisateur = await utilisateurDepuisRequete(req);
    if (!utilisateur) return Response.json({ erreur: "Session expirée : reconnectez-vous" }, { status: 401 });
    const ligne = await enregistrerPhoto(utilisateur.id, photo.octets, photo.type, photo.extension);
    return Response.json({ ligne });
  } catch (e) {
    console.error(e);
    return Response.json({ erreur: "Erreur du serveur, réessayez dans un instant" }, { status: 500 });
  }
}
