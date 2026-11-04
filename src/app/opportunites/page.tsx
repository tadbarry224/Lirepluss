"use client";

import { useState } from "react";
import { domaineNom, domaines } from "@/lib/data";
import { formatDate, useStore } from "@/lib/store";
import type { Opportunite } from "@/lib/types";
import { Badge, Carte, Titre, bouton, boutonSecondaire, champ } from "@/components/ui";

const types: Opportunite["type"][] = ["Stage", "Emploi", "Bourse", "Concours", "Financement", "Formation"];

function Publier({ fermer }: { fermer: () => void }) {
  const { publierOpportunite, profil } = useStore();
  const [f, setF] = useState({ titre: "", type: "Stage" as Opportunite["type"], organisation: "", lieu: "", dateLimite: "", domaine: "dev", description: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  function valider(e: React.FormEvent) {
    e.preventDefault();
    if (!f.titre || !f.organisation || !f.dateLimite) return;
    publierOpportunite({ ...f, publiePar: profil.nom });
    fermer();
  }

  return (
    <Carte className="mb-6">
      <form onSubmit={valider} className="grid gap-3 sm:grid-cols-2">
        <input value={f.titre} onChange={set("titre")} placeholder="Intitulé" className={`${champ} sm:col-span-2`} />
        <select value={f.type} onChange={set("type")} className={champ}>{types.map((t) => <option key={t}>{t}</option>)}</select>
        <select value={f.domaine} onChange={set("domaine")} className={champ}>{domaines.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}</select>
        <input value={f.organisation} onChange={set("organisation")} placeholder="Organisation" className={champ} />
        <input value={f.lieu} onChange={set("lieu")} placeholder="Lieu" className={champ} />
        <label className="text-sm sm:col-span-2">Date limite <input type="date" value={f.dateLimite} onChange={set("dateLimite")} className={`${champ} mt-1`} /></label>
        <textarea value={f.description} onChange={set("description")} rows={3} placeholder="Description" className={`${champ} sm:col-span-2`} />
        <div className="flex gap-2 sm:col-span-2">
          <button className={bouton}>Publier</button>
          <button type="button" onClick={fermer} className={boutonSecondaire}>Annuler</button>
        </div>
      </form>
    </Carte>
  );
}

export default function Opportunites() {
  const { opportunites, profil } = useStore();
  const [type, setType] = useState("");
  const [pourMoi, setPourMoi] = useState(false);
  const [publier, setPublier] = useState(false);
  const [maintenant] = useState(() => Date.now());

  const liste = opportunites
    .filter((o) => (!type || o.type === type) && (!pourMoi || profil.domaines.includes(o.domaine)))
    .sort((a, b) => a.dateLimite.localeCompare(b.dateLimite));

  const joursRestants = (d: string) => Math.ceil((new Date(d).getTime() - maintenant) / 86400000);

  return (
    <div>
      <Titre titre="Opportunités" sousTitre="Stages, emplois, bourses, concours et financements partagés par la communauté." action={!publier && <button onClick={() => setPublier(true)} className={bouton}>+ Partager une opportunité</button>} />
      {publier && <Publier fermer={() => setPublier(false)} />}
      <div className="mb-6 flex flex-wrap gap-2">
        {["", ...types].map((t) => (
          <button key={t} onClick={() => setType(t)} className={`rounded-full px-3 py-1 text-sm font-medium ${type === t ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>{t || "Toutes"}</button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pourMoi} onChange={(e) => setPourMoi(e.target.checked)} className="accent-emerald-600" /> Mes domaines uniquement
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {liste.map((o) => {
          const j = joursRestants(o.dateLimite);
          return (
            <Carte key={o.id}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge ton="vert">{o.type}</Badge>
                <Badge>{domaineNom(o.domaine)}</Badge>
                <span className="ml-auto">{j < 0 ? <Badge ton="rouge">Clôturée</Badge> : j <= 14 ? <Badge ton="ambre">J-{j}</Badge> : null}</span>
              </div>
              <h2 className="mt-3 font-semibold">{o.titre}</h2>
              <p className="text-sm text-slate-500">{o.organisation} · {o.lieu}</p>
              <p className="mt-2 text-sm">{o.description}</p>
              <p className="mt-3 text-xs text-slate-500">Date limite : {formatDate(o.dateLimite)} · Partagé par {o.publiePar}</p>
            </Carte>
          );
        })}
      </div>
      {liste.length === 0 && <p className="py-10 text-center text-slate-500">Aucune opportunité.</p>}
    </div>
  );
}
