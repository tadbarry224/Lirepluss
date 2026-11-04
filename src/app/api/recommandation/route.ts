import Anthropic from "@anthropic-ai/sdk";
import { domaineNom, mentors } from "@/lib/data";
import type { Profil, Recommandation } from "@/lib/types";

// Recommandation de mentors par Claude.
// Si aucune clé API n'est configurée ou si l'appel échoue, la route renvoie 503
// et l'interface bascule automatiquement sur l'algorithme local (src/lib/matching.ts).

const schema = {
  type: "object",
  properties: {
    recommandations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          mentorId: { type: "string", enum: mentors.map((m) => m.id) },
          score: { type: "integer" },
          raison: { type: "string" },
        },
        required: ["mentorId", "score", "raison"],
        additionalProperties: false,
      },
    },
  },
  required: ["recommandations"],
  additionalProperties: false,
} as const;

const catalogue = mentors
  .map(
    (m) =>
      `- id=${m.id} | ${m.nom}, ${m.titre} (${m.organisation}, ${m.ville}) | domaines: ${m.domaines.map(domaineNom).join(", ")} | compétences: ${m.competences.join(", ")} | ${m.experience} ans | langues: ${m.langues.join(", ")} | ${m.bio}`,
  )
  .join("\n");

const system = `Tu es le moteur de mise en relation d'une plateforme de mentorat professionnel en Guinée.
À partir du profil d'un bénéficiaire, choisis les 3 mentors les plus adaptés dans le catalogue ci-dessous.
Pour chacun, donne un score de compatibilité de 0 à 100 et une raison courte (une ou deux phrases, en français,
en tutoyant le bénéficiaire) qui explique concrètement ce que ce mentor peut lui apporter.
Classe les mentors du plus pertinent au moins pertinent.

Catalogue des mentors :
${catalogue}`;

export async function POST(req: Request) {
  let profil: Profil;
  try {
    ({ profil } = (await req.json()) as { profil: Profil });
    if (!profil?.besoins) throw new Error();
  } catch {
    return Response.json({ erreur: "Profil invalide" }, { status: 400 });
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
          content: `Profil du bénéficiaire :
- Nom : ${profil.nom}
- Situation : ${profil.niveau}, ${profil.ville}
- Domaines d'intérêt : ${profil.domaines.map(domaineNom).join(", ") || "non précisé"}
- Compétences : ${profil.competences.join(", ") || "non précisé"}
- Besoins : ${profil.besoins}`,
        },
      ],
    });

    if (reponse.stop_reason === "refusal") {
      return Response.json({ erreur: "Requête refusée" }, { status: 503 });
    }

    const texte = reponse.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    const { recommandations } = JSON.parse(texte) as { recommandations: Recommandation[] };
    return Response.json({ recommandations: recommandations.slice(0, 3) });
  } catch (e) {
    console.error("Recommandation IA indisponible :", e instanceof Error ? e.message : e);
    return Response.json({ erreur: "IA indisponible" }, { status: 503 });
  }
}
