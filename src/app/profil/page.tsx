"use client";

import { useState } from "react";
import { domaines } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { Profil } from "@/lib/types";
import { Carte, Titre, bouton, boutonSecondaire, champ } from "@/components/ui";

const niveaux: Profil["niveau"][] = ["Étudiant", "Jeune diplômé", "Professionnel", "Entrepreneur"];

export default function PageProfil() {
  const { pret } = useStore();
  // On attend le chargement du localStorage pour initialiser le formulaire avec le bon profil.
  if (!pret) return null;
  return <FormulaireProfil />;
}

function FormulaireProfil() {
  const { profil, majProfil, reinitialiser } = useStore();
  const [f, setF] = useState<Profil>(profil);
  const [competences, setCompetences] = useState(profil.competences.join(", "));
  const [ok, setOk] = useState(false);

  const basculerDomaine = (id: string) =>
    setF({ ...f, domaines: f.domaines.includes(id) ? f.domaines.filter((d) => d !== id) : [...f.domaines, id] });

  function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    majProfil({ ...f, competences: competences.split(",").map((c) => c.trim()).filter(Boolean) });
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  }

  return (
    <div className="max-w-3xl">
      <Titre titre="Mon profil" sousTitre="Plus votre profil est complet, plus les recommandations de mentors sont pertinentes." />
      <form onSubmit={enregistrer} className="space-y-6">
        <Carte className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["mentore", "mentor"] as const).map((r) => (
              <button type="button" key={r} onClick={() => setF({ ...f, role: r })} className={`rounded-xl border p-4 text-left ${f.role === r ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 dark:border-slate-700"}`}>
                <p className="text-2xl">{r === "mentore" ? "🌱" : "🧑‍🏫"}</p>
                <p className="mt-1 font-semibold">{r === "mentore" ? "Je cherche un mentor" : "Je veux devenir mentor"}</p>
                <p className="text-xs text-slate-500">{r === "mentore" ? "Être accompagné dans mon parcours" : "Transmettre mon expérience"}</p>
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm sm:col-span-1">Nom<input value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} className={`${champ} mt-1`} /></label>
            <label className="text-sm">Ville<input value={f.ville} onChange={(e) => setF({ ...f, ville: e.target.value })} className={`${champ} mt-1`} /></label>
            <label className="text-sm">Situation
              <select value={f.niveau} onChange={(e) => setF({ ...f, niveau: e.target.value as Profil["niveau"] })} className={`${champ} mt-1`}>
                {niveaux.map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
          </div>
        </Carte>

        <Carte className="space-y-4">
          <p className="font-semibold">{f.role === "mentor" ? "Mes domaines d'expertise" : "Domaines qui m'intéressent"}</p>
          <div className="flex flex-wrap gap-2">
            {domaines.map((d) => (
              <button type="button" key={d.id} onClick={() => basculerDomaine(d.id)} className={`rounded-full border px-3 py-1 text-sm ${f.domaines.includes(d.id) ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                {d.icone} {d.nom}
              </button>
            ))}
          </div>
          <label className="block text-sm">Compétences (séparées par des virgules)
            <input value={competences} onChange={(e) => setCompetences(e.target.value)} className={`${champ} mt-1`} placeholder="React, Business plan, Prise de parole…" />
          </label>
          <label className="block text-sm">{f.role === "mentor" ? "Ce que je peux apporter" : "Mes besoins et objectifs"}
            <textarea value={f.besoins} onChange={(e) => setF({ ...f, besoins: e.target.value })} rows={4} className={`${champ} mt-1`} />
          </label>
        </Carte>

        <div className="flex flex-wrap items-center gap-3">
          <button className={bouton}>Enregistrer</button>
          {ok && <span className="text-sm text-emerald-600">✓ Profil enregistré</span>}
          <button type="button" onClick={() => { if (confirm("Réinitialiser toutes les données de démo ?")) reinitialiser(); }} className={`${boutonSecondaire} ml-auto`}>Réinitialiser la démo</button>
        </div>
      </form>
    </div>
  );
}
