"use client";

import { useState } from "react";

import { formatDate, progression, uid, useStore } from "@/lib/store";
import { Barre, Carte, Titre, bouton, boutonSecondaire, champ } from "@/components/ui";
import { GenerateurParcours } from "@/components/GenerateurParcours";

function NouvelObjectif({ fermer }: { fermer: () => void }) {
  const { ajouterObjectif, tousMentors: mentors } = useStore();
  const [titre, setTitre] = useState("");
  const [echeance, setEcheance] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [etapes, setEtapes] = useState("");

  function valider(e: React.FormEvent) {
    e.preventDefault();
    if (!titre.trim() || !echeance) return;
    ajouterObjectif({
      titre,
      echeance: new Date(echeance).toISOString(),
      mentorId: mentorId || undefined,
      etapes: etapes.split("\n").map((t) => t.trim()).filter(Boolean).map((t) => ({ id: uid(), titre: t, fait: false })),
    });
    fermer();
  }

  return (
    <Carte className="mb-6">
      <form onSubmit={valider} className="grid gap-3 sm:grid-cols-2">
        <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Objectif (ex : obtenir une bourse de master)" className={`${champ} sm:col-span-2`} />
        <input type="date" value={echeance} onChange={(e) => setEcheance(e.target.value)} className={champ} />
        <select value={mentorId} onChange={(e) => setMentorId(e.target.value)} className={champ}>
          <option value="">Mentor associé (optionnel)</option>
          {mentors.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
        </select>
        <textarea value={etapes} onChange={(e) => setEtapes(e.target.value)} rows={3} placeholder={"Étapes, une par ligne\nEx : Rédiger ma lettre de motivation"} className={`${champ} sm:col-span-2`} />
        <div className="flex gap-2 sm:col-span-2">
          <button className={bouton}>Créer l&apos;objectif</button>
          <button type="button" onClick={fermer} className={boutonSecondaire}>Annuler</button>
        </div>
      </form>
    </Carte>
  );
}

export default function Objectifs() {
  const { objectifs, basculerEtape, ajouterEtape, supprimerObjectif, tousMentors: mentors } = useStore();
  const [creation, setCreation] = useState(false);
  const [nouvelles, setNouvelles] = useState<Record<string, string>>({});

  return (
    <div>
      <Titre titre="Objectifs & progression" sousTitre="Fixez vos objectifs de carrière et suivez vos progrès avec votre mentor." action={!creation && <button onClick={() => setCreation(true)} className={bouton}>+ Nouvel objectif</button>} />
      <GenerateurParcours />
      {creation && <NouvelObjectif fermer={() => setCreation(false)} />}
      <div className="grid gap-4 lg:grid-cols-2">
        {objectifs.map((o) => {
          const p = progression(o);
          const mentor = mentors.find((m) => m.id === o.mentorId);
          return (
            <Carte key={o.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{o.titre}</h2>
                  <p className="text-xs text-slate-500">Échéance : {formatDate(o.echeance)}{mentor ? ` · Mentor : ${mentor.nom}` : ""}</p>
                </div>
                <span className={`text-lg font-bold ${p === 100 ? "text-emerald-600" : ""}`}>{p === 100 ? "🏆" : `${p}%`}</span>
              </div>
              <div className="my-3"><Barre valeur={p} /></div>
              <ul className="space-y-1">
                {o.etapes.map((e) => (
                  <li key={e.id}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                      <input type="checkbox" checked={e.fait} onChange={() => basculerEtape(o.id, e.id)} className="h-4 w-4 accent-emerald-600" />
                      <span className={e.fait ? "text-slate-400 line-through" : ""}>{e.titre}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <form
                onSubmit={(ev) => {
                  ev.preventDefault();
                  const t = nouvelles[o.id]?.trim();
                  if (t) ajouterEtape(o.id, t);
                  setNouvelles({ ...nouvelles, [o.id]: "" });
                }}
                className="mt-3 flex gap-2"
              >
                <input value={nouvelles[o.id] ?? ""} onChange={(e) => setNouvelles({ ...nouvelles, [o.id]: e.target.value })} placeholder="Ajouter une étape…" className={champ} />
                <button className={boutonSecondaire}>+</button>
              </form>
              <button onClick={() => supprimerObjectif(o.id)} className="mt-3 text-xs text-rose-600 hover:underline">Supprimer</button>
            </Carte>
          );
        })}
      </div>
      {objectifs.length === 0 && !creation && <p className="py-10 text-center text-slate-500">Aucun objectif pour le moment.</p>}
    </div>
  );
}
