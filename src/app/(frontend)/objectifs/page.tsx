"use client";

import { useState } from "react";

import { formatDate, progression, uid, useStore } from "@/frontend/store";
import { Barre, Carte, ErreurChamp, Titre, aujourdhui, bouton, boutonSecondaire, champ } from "@/frontend/components/ui";
import { GenerateurParcours } from "@/frontend/components/GenerateurParcours";

function NouvelObjectif({ fermer }: { fermer: () => void }) {
  const { ajouterObjectif, tousMentors: mentors } = useStore();
  const [titre, setTitre] = useState("");
  const [echeance, setEcheance] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [etapes, setEtapes] = useState("");
  const [erreurs, setErreurs] = useState<{ titre?: string; echeance?: string }>({});

  function valider(e: React.FormEvent) {
    e.preventDefault();
    const trouvees = {
      titre: titre.trim().length < 3 ? "Décrivez votre objectif (3 caractères minimum)" : undefined,
      echeance: !echeance ? "Choisissez une échéance" : echeance < aujourdhui() ? "L'échéance doit être aujourd'hui ou plus tard" : undefined,
    };
    setErreurs(trouvees);
    if (trouvees.titre || trouvees.echeance) return;
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
      <form onSubmit={valider} noValidate className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">Objectif
          <input value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex : obtenir une bourse de master" aria-invalid={Boolean(erreurs.titre)} className={`${champ} mt-1 font-normal`} />
          <ErreurChamp message={erreurs.titre} />
        </label>
        <label className="text-sm font-medium">Échéance
          <input type="date" value={echeance} min={aujourdhui()} onChange={(e) => setEcheance(e.target.value)} aria-invalid={Boolean(erreurs.echeance)} className={`${champ} mt-1 font-normal`} />
          <ErreurChamp message={erreurs.echeance} />
        </label>
        <label className="text-sm font-medium">Mentor associé <span className="font-normal text-slate-500">(optionnel)</span>
          <select value={mentorId} onChange={(e) => setMentorId(e.target.value)} className={`${champ} mt-1 font-normal`}>
            <option value="">Aucun</option>
            {mentors.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </label>
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
