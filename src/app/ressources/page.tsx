"use client";

import { useState } from "react";
import { domaineNom, domaines, ressources } from "@/lib/data";
import { Badge, Carte, Titre, champ } from "@/components/ui";

const types = ["Article", "Vidéo", "Guide", "Podcast", "Modèle"] as const;
const icones: Record<string, string> = { Article: "📰", Vidéo: "🎬", Guide: "📘", Podcast: "🎧", Modèle: "📄" };

export default function Ressources() {
  const [q, setQ] = useState("");
  const [domaine, setDomaine] = useState("");
  const [type, setType] = useState("");
  const [ouverte, setOuverte] = useState<string | null>(null);

  const liste = ressources.filter(
    (r) =>
      (!domaine || r.domaine === domaine) &&
      (!type || r.type === type) &&
      (!q || `${r.titre} ${r.resume} ${r.auteur}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div>
      <Titre titre="Bibliothèque de ressources" sousTitre="Conseils professionnels, guides et modèles partagés par les mentors." />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une ressource…" className={champ} />
        <select value={domaine} onChange={(e) => setDomaine(e.target.value)} className={champ}>
          <option value="">Tous les domaines</option>
          {domaines.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} className={champ}>
          <option value="">Tous les formats</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {liste.map((r) => (
          <Carte key={r.id} className="flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-3xl">{icones[r.type]}</span>
              <Badge ton="bleu">{r.type} · {r.duree}</Badge>
            </div>
            <h2 className="mt-3 font-semibold">{r.titre}</h2>
            <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">{r.resume}</p>
            <p className="mt-3 text-xs text-slate-500">Par {r.auteur} · {domaineNom(r.domaine)}</p>
            <button onClick={() => setOuverte(ouverte === r.id ? null : r.id)} className="mt-3 text-left text-sm font-medium text-emerald-600 hover:underline">
              {ouverte === r.id ? "Fermer" : "Consulter →"}
            </button>
            {ouverte === r.id && (
              <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
                Contenu de démonstration. Dans la version finale, la ressource complète ({r.type.toLowerCase()}) s&apos;affiche ici.
              </p>
            )}
          </Carte>
        ))}
      </div>
      {liste.length === 0 && <p className="py-10 text-center text-slate-500">Aucune ressource trouvée.</p>}
    </div>
  );
}
