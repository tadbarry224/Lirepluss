import { mentorsDepuisRequete } from "@/backend/services/ia/catalogue";
import { recommanderMentors } from "@/backend/services/ia/recommandation";
import type { Profil } from "@/shared/types";

/** POST /api/recommandation : mentors recommandés par l'IA. 503 si l'IA est indisponible (le frontend utilise alors l'algorithme local). */
export async function POST(req: Request) {
  let corps: { profil: Profil; mentors?: unknown };
  try {
    corps = await req.json();
    if (!corps.profil?.besoins) throw new Error();
  } catch {
    return Response.json({ erreur: "Profil invalide" }, { status: 400 });
  }

  try {
    const recommandations = await recommanderMentors(corps.profil, mentorsDepuisRequete(corps.mentors));
    return Response.json({ recommandations });
  } catch (e) {
    console.error("Recommandation IA indisponible :", e instanceof Error ? e.message : e);
    return Response.json({ erreur: "IA indisponible" }, { status: 503 });
  }
}
