import { mentorsDepuisRequete } from "@/backend/services/ia/catalogue";
import { genererParcours } from "@/backend/services/ia/parcours";
import type { Profil } from "@/shared/types";

/** POST /api/parcours : parcours personnalisé par l'IA. 503 si l'IA est indisponible (le frontend utilise alors un parcours type). */
export async function POST(req: Request) {
  let corps: { profil: Profil; objectif: string; mentors?: unknown };
  try {
    corps = await req.json();
    if (!corps.objectif?.trim() || !corps.profil) throw new Error();
  } catch {
    return Response.json({ erreur: "Requête invalide" }, { status: 400 });
  }

  try {
    const parcours = await genererParcours(corps.profil, corps.objectif, mentorsDepuisRequete(corps.mentors));
    return Response.json({ parcours });
  } catch (e) {
    console.error("Parcours IA indisponible :", e instanceof Error ? e.message : e);
    return Response.json({ erreur: "IA indisponible" }, { status: 503 });
  }
}
