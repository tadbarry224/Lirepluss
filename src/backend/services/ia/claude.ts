import Anthropic from "@anthropic-ai/sdk";

/** Erreur levée quand l'IA ne peut pas répondre (pas de clé, réseau, refus) : le frontend bascule alors sur l'algorithme local. */
export class IAIndisponible extends Error {}

/**
 * Appelle Claude avec une sortie JSON structurée et renvoie l'objet décodé.
 * Le repli automatique sur un autre modèle Claude est activé en cas de refus (fallbacks: "default").
 */
export async function demanderJSON<T>(system: string, question: string, schema: Record<string, unknown>): Promise<T> {
  try {
    const client = new Anthropic();
    const reponse = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema } },
      system,
      messages: [{ role: "user", content: question }],
    });
    if (reponse.stop_reason === "refusal") throw new IAIndisponible("Requête refusée par l'IA");
    const texte = reponse.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    return JSON.parse(texte) as T;
  } catch (e) {
    if (e instanceof IAIndisponible) throw e;
    throw new IAIndisponible(e instanceof Error ? e.message : String(e));
  }
}
