"use client";

import { useState } from "react";
import { parcoursLocal, type ParcoursPropose } from "@/lib/parcours";
import { uid, useStore } from "@/lib/store";
import { Carte, bouton, boutonSecondaire, champ } from "./ui";

export function GenerateurParcours() {
  const { profil, tousMentors, ajouterObjectif } = useStore();
  const [objectif, setObjectif] = useState("");
  const [parcours, setParcours] = useState<ParcoursPropose | null>(null);
  const [source, setSource] = useState<"ia" | "local" | null>(null);
  const [chargement, setChargement] = useState(false);
  const mentor = tousMentors.find((m) => m.id === parcours?.mentorId);

  async function generer() {
    setChargement(true);
    setParcours(null);
    try {
      const rep = await fetch("/api/parcours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profil, objectif, mentors: tousMentors }),
      });
      if (!rep.ok) throw new Error();
      setParcours(((await rep.json()) as { parcours: ParcoursPropose }).parcours);
      setSource("ia");
    } catch {
      setParcours({ ...parcoursLocal(profil, tousMentors), titre: objectif.trim() || parcoursLocal(profil, tousMentors).titre });
      setSource("local");
    } finally {
      setChargement(false);
    }
  }

  function ajouter() {
    if (!parcours) return;
    const echeance = new Date();
    echeance.setDate(echeance.getDate() + 60);
    ajouterObjectif({
      titre: parcours.titre,
      echeance: echeance.toISOString(),
      mentorId: parcours.mentorId,
      etapes: parcours.etapes.map((t) => ({ id: uid(), titre: t, fait: false })),
    });
    setParcours(null);
    setObjectif("");
  }

  return (
    <Carte className="mb-6 border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
      <h2 className="font-semibold">✨ Construire mon parcours avec l&apos;IA</h2>
      <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Décrivez ce que vous voulez atteindre : l&apos;IA propose des étapes adaptées à votre profil et le mentor le plus utile.</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={objectif} onChange={(e) => setObjectif(e.target.value)} placeholder="Ex : publier mon premier roman, obtenir un master en France, lancer ma boutique en ligne…" className={champ} />
        <button onClick={generer} disabled={chargement || !objectif.trim()} className={`${bouton} shrink-0`}>{chargement ? "Génération…" : "Générer mon parcours"}</button>
      </div>

      {parcours && (
        <div className="mt-4 rounded-xl bg-white p-4 dark:bg-slate-900">
          <p className="text-xs text-slate-500">{source === "ia" ? "Parcours généré par Claude (IA)" : "Parcours type (IA indisponible)"}</p>
          <h3 className="mt-1 font-semibold">{parcours.titre}</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {parcours.etapes.map((e) => <li key={e}>{e}</li>)}
          </ol>
          <p className="mt-3 text-sm text-emerald-800 dark:text-emerald-300">💡 {parcours.conseil}</p>
          {mentor && <p className="mt-2 text-sm">🤝 Mentor suggéré : <strong>{mentor.nom}</strong>, {mentor.titre}</p>}
          <div className="mt-3 flex gap-2">
            <button onClick={ajouter} className={bouton}>Ajouter à mes objectifs</button>
            <button onClick={() => setParcours(null)} className={boutonSecondaire}>Ignorer</button>
          </div>
        </div>
      )}
    </Carte>
  );
}
