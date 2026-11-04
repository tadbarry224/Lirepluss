"use client";

import Link from "next/link";
import { useState } from "react";
import { domaines } from "@/lib/data";
import { useStore } from "@/lib/store";
import { profilsBeneficiaires, type Profil } from "@/lib/types";
import { Carte, Titre, bouton, boutonSecondaire, champ } from "@/components/ui";

const liste = (s: string) => s.split(",").map((c) => c.trim()).filter(Boolean);

export default function PageProfil() {
  const { pret } = useStore();
  // On attend le chargement du localStorage pour initialiser le formulaire avec le bon profil.
  if (!pret) return null;
  return <FormulaireProfil />;
}

function FormulaireProfil() {
  const { profil, majProfil, reinitialiser, publierProfilMentor, retirerProfilMentor, monIdMentor, mode } = useStore();
  const [f, setF] = useState<Profil>(profil);
  const [competences, setCompetences] = useState(profil.competences.join(", "));
  const [langues, setLangues] = useState((profil.langues ?? ["Français"]).join(", "));
  const [dispos, setDispos] = useState((profil.disponibilites ?? ["Sam 10:00"]).join(", "));
  const [ok, setOk] = useState("");
  const estPublie = monIdMentor !== null;
  const mentor = f.role === "mentor";

  const basculerDomaine = (id: string) =>
    setF({ ...f, domaines: f.domaines.includes(id) ? f.domaines.filter((d) => d !== id) : [...f.domaines, id] });

  function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    const complet: Profil = { ...f, competences: liste(competences), langues: liste(langues), disponibilites: liste(dispos) };
    majProfil(complet);
    if (mentor) {
      publierProfilMentor(complet);
      setOk("Profil de mentor publié : vous apparaissez maintenant dans la recherche.");
    } else {
      if (estPublie) retirerProfilMentor();
      setOk("Profil enregistré.");
    }
    setTimeout(() => setOk(""), 4000);
  }

  return (
    <div className="max-w-3xl">
      <Titre titre="Mon profil" sousTitre="Plus votre profil est complet, plus la mise en relation est pertinente." />
      <form onSubmit={enregistrer} className="space-y-6">
        <Carte className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["mentore", "mentor"] as const).map((r) => (
              <button type="button" key={r} onClick={() => setF({ ...f, role: r, niveau: r === "mentor" ? "Professionnel expérimenté" : f.niveau === "Professionnel expérimenté" ? "Étudiant" : f.niveau })} className={`rounded-xl border p-4 text-left ${f.role === r ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 dark:border-slate-700"}`}>
                <p className="text-2xl">{r === "mentore" ? "🌱" : "🧑‍🏫"}</p>
                <p className="mt-1 font-semibold">{r === "mentore" ? "Je cherche un mentor" : "Je veux devenir mentor"}</p>
                <p className="text-xs text-slate-500">{r === "mentore" ? "Être accompagné dans mon parcours" : "Transmettre mon expérience"}</p>
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm">Nom complet<input value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} className={`${champ} mt-1`} /></label>
            <label className="text-sm">Ville<input value={f.ville} onChange={(e) => setF({ ...f, ville: e.target.value })} className={`${champ} mt-1`} /></label>
            <label className="text-sm">Profil
              <select value={f.niveau} onChange={(e) => setF({ ...f, niveau: e.target.value as Profil["niveau"] })} className={`${champ} mt-1`}>
                {profilsBeneficiaires.map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
          </div>
        </Carte>

        {mentor && (
          <Carte className="space-y-3">
            <p className="font-semibold">Informations de mentor</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm">Poste<input value={f.titre ?? ""} onChange={(e) => setF({ ...f, titre: e.target.value })} placeholder="Ex : Chef de projet" className={`${champ} mt-1`} /></label>
              <label className="text-sm">Organisation<input value={f.organisation ?? ""} onChange={(e) => setF({ ...f, organisation: e.target.value })} className={`${champ} mt-1`} /></label>
              <label className="text-sm">Années d&apos;expérience<input type="number" min={1} value={f.experience ?? 1} onChange={(e) => setF({ ...f, experience: Number(e.target.value) })} className={`${champ} mt-1`} /></label>
            </div>
            <label className="block text-sm">Langues (séparées par des virgules)<input value={langues} onChange={(e) => setLangues(e.target.value)} className={`${champ} mt-1`} /></label>
            <label className="block text-sm">Disponibilités (ex : Lun 18:00, Sam 10:00)<input value={dispos} onChange={(e) => setDispos(e.target.value)} className={`${champ} mt-1`} /></label>
            <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
              En tant que mentor, vous vous engagez à accompagner avec bienveillance et professionnalisme, et à aider le mentoré à développer son autonomie
              sans faire à sa place.
            </p>
          </Carte>
        )}

        <Carte className="space-y-4">
          <p className="font-semibold">{mentor ? "Mes domaines d'expertise" : "Domaines dans lesquels je souhaite être accompagné"}</p>
          <div className="flex flex-wrap gap-2">
            {domaines.map((d) => (
              <button type="button" key={d.id} onClick={() => basculerDomaine(d.id)} className={`rounded-full border px-3 py-1 text-sm ${f.domaines.includes(d.id) ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                {d.icone} {d.nom}
              </button>
            ))}
          </div>
          <label className="block text-sm">{mentor ? "Compétences que je peux transmettre" : "Compétences que j'ai ou que je veux développer"} (séparées par des virgules)
            <input value={competences} onChange={(e) => setCompetences(e.target.value)} className={`${champ} mt-1`} placeholder="Ex : Prise de parole en public, Business plan…" />
          </label>
          <label className="block text-sm">{mentor ? "Présentation : mon parcours et ce que je peux apporter" : "Mes besoins et mes objectifs"}
            <textarea value={f.besoins} onChange={(e) => setF({ ...f, besoins: e.target.value })} rows={4} className={`${champ} mt-1`} />
          </label>
        </Carte>

        <div className="flex flex-wrap items-center gap-3">
          <button className={bouton}>{mentor ? (estPublie ? "Mettre à jour mon profil de mentor" : "Publier mon profil de mentor") : "Enregistrer"}</button>
          {estPublie && <Link href={`/mentors/${monIdMentor}`} className={boutonSecondaire}>Voir ma fiche publique</Link>}
          {ok && <span className="text-sm text-emerald-600">✓ {ok}</span>}
          {mode === "demo" && <button type="button" onClick={() => { if (confirm("Réinitialiser toutes les données de démo ?")) reinitialiser(); }} className={`${boutonSecondaire} ml-auto`}>Réinitialiser la démo</button>}
        </div>
      </form>
    </div>
  );
}
