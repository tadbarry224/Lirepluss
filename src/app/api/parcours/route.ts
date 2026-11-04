import Anthropic from "@anthropic-ai/sdk";
import { AVERTISSEMENT_CAMPUS_FRANCE, domaineNom, domaines, mentors } from "@/lib/data";
import type { ParcoursPropose } from "@/lib/parcours";
import type { Profil } from "@/lib/types";

// Génère un parcours d'accompagnement personnalisé avec Claude.
// En cas d'indisponibilité (pas de clé API, réseau…), renvoie 503 :
// l'interface utilise alors les parcours types de src/lib/parcours.ts.

const schema = {
  type: "object",
  properties: {
    titre: { type: "string" },
    etapes: { type: "array", items: { type: "string" } },
    conseil: { type: "string" },
    mentorId: { type: "string", enum: mentors.map((m) => m.id) },
  },
  required: ["titre", "etapes", "conseil", "mentorId"],
  additionalProperties: false,
} as const;

const system = `Tu es un conseiller d'orientation d'une plateforme de mentorat pour les jeunes en Guinée.
À partir du profil et de l'objectif d'un bénéficiaire, propose un parcours d'accompagnement :
- "titre" : l'objectif reformulé de façon motivante et concrète (moins de 10 mots) ;
- "etapes" : entre 4 et 6 étapes concrètes, courtes, réalisables en quelques semaines, dans l'ordre ;
- "conseil" : un conseil personnalisé d'une ou deux phrases, en tutoyant le bénéficiaire ;
- "mentorId" : le mentor du catalogue le plus utile pour ce parcours.
Le mentor accompagne mais ne fait pas à la place du mentoré : les étapes doivent développer son autonomie.
Pour tout ce qui concerne Campus France, rappelle dans le conseil que : ${AVERTISSEMENT_CAMPUS_FRANCE}

Domaines : ${domaines.map((d) => `${d.nom} (${d.sousDomaines.join(", ")})`).join(" ; ")}

Catalogue des mentors :
${mentors.map((m) => `- id=${m.id} | ${m.nom}, ${m.titre} | ${m.domaines.map(domaineNom).join(", ")} | ${m.competences.join(", ")}`).join("\n")}`;

export async function POST(req: Request) {
  let profil: Profil;
  let objectif: string;
  try {
    ({ profil, objectif } = (await req.json()) as { profil: Profil; objectif: string });
    if (!objectif?.trim()) throw new Error();
  } catch {
    return Response.json({ erreur: "Requête invalide" }, { status: 400 });
  }

  try {
    const client = new Anthropic();
    const reponse = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      system,
      messages: [
        {
          role: "user",
          content: `Profil : ${profil.niveau}, ${profil.ville}. Domaines : ${profil.domaines.map(domaineNom).join(", ") || "non précisé"}. Compétences : ${profil.competences.join(", ") || "non précisé"}.
Situation : ${profil.besoins}
Objectif à atteindre : ${objectif}`,
        },
      ],
    });

    if (reponse.stop_reason === "refusal") {
      return Response.json({ erreur: "Requête refusée" }, { status: 503 });
    }
    const texte = reponse.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const parcours = JSON.parse(texte) as ParcoursPropose;
    return Response.json({ parcours: { ...parcours, etapes: parcours.etapes.slice(0, 6) } });
  } catch (e) {
    console.error("Parcours IA indisponible :", e instanceof Error ? e.message : e);
    return Response.json({ erreur: "IA indisponible" }, { status: 503 });
  }
}
