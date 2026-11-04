"use client";

import Link from "next/link";
import { useState } from "react";
import { ChampPhoto } from "@/frontend/components/ChampPhoto";
import { Carte, ErreurChamp, Titre, bouton, boutonSecondaire, champ } from "@/frontend/components/ui";
import { useStore } from "@/frontend/store";
import { attentesProgramme, charteMentor, domaines } from "@/shared/data";
import { profilsBeneficiaires, type Profil } from "@/shared/types";
import { validerProfil, type ErreursProfil } from "@/shared/validation/profil";

const liste = (s: string) => s.split(",").map((c) => c.trim()).filter(Boolean);

export default function PageProfil() {
  const { pret } = useStore();
  // On attend le chargement des données pour initialiser le formulaire avec le bon profil.
  if (!pret) return null;
  return <FormulaireProfil />;
}

function FormulaireProfil() {
  const { profil, enregistrerProfil, reinitialiser, monIdMentor, mode } = useStore();
  const [f, setF] = useState<Profil>(profil);
  const [competences, setCompetences] = useState(profil.competences.join(", "));
  const [langues, setLangues] = useState((profil.langues ?? ["Français"]).join(", "));
  const [dispos, setDispos] = useState((profil.disponibilites ?? []).join(", "));
  const [erreurs, setErreurs] = useState<ErreursProfil>({});
  const [envoi, setEnvoi] = useState(false);
  const [ok, setOk] = useState("");
  const mentor = f.role === "mentor";

  const basculerDomaine = (id: string) =>
    setF({ ...f, domaines: f.domaines.includes(id) ? f.domaines.filter((d) => d !== id) : [...f.domaines, id] });

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setOk("");
    const complet: Profil = { ...f, competences: liste(competences), langues: liste(langues), disponibilites: liste(dispos) };

    // 1. Vérification immédiate dans le navigateur (mêmes règles que le serveur)
    const local = validerProfil(complet);
    if (!local.ok) {
      setErreurs(local.erreurs);
      return;
    }
    // 2. Enregistrement : le backend revalide et a le dernier mot
    setEnvoi(true);
    const resultat = await enregistrerProfil(complet);
    setEnvoi(false);
    if (!resultat.ok) {
      setErreurs(resultat.erreurs);
      return;
    }
    setErreurs({});
    setOk(mentor ? "Profil de mentor publié : vous apparaissez dans la recherche." : "Profil enregistré.");
    setTimeout(() => setOk(""), 4000);
  }

  const nbErreurs = Object.keys(erreurs).length;

  return (
    <div className="max-w-3xl">
      <Titre titre="Mon profil" sousTitre="Plus votre profil est complet, plus la mise en relation est pertinente." />
      <form onSubmit={enregistrer} noValidate className="space-y-6">
        <Carte className="space-y-4">
          <ChampPhoto />
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
            <label className="text-sm">Nom complet
              <input value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} aria-invalid={Boolean(erreurs.nom)} className={`${champ} mt-1`} />
              <ErreurChamp message={erreurs.nom} />
            </label>
            <label className="text-sm">Ville
              <input value={f.ville} onChange={(e) => setF({ ...f, ville: e.target.value })} aria-invalid={Boolean(erreurs.ville)} className={`${champ} mt-1`} />
              <ErreurChamp message={erreurs.ville} />
            </label>
            <label className="text-sm">Profil
              <select value={f.niveau} onChange={(e) => setF({ ...f, niveau: e.target.value as Profil["niveau"] })} className={`${champ} mt-1`}>
                {profilsBeneficiaires.map((n) => <option key={n}>{n}</option>)}
              </select>
              <ErreurChamp message={erreurs.niveau} />
            </label>
          </div>
        </Carte>

        {mentor && (
          <Carte className="space-y-3">
            <p className="font-semibold">Informations de mentor</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="text-sm">Poste
                <input value={f.titre ?? ""} onChange={(e) => setF({ ...f, titre: e.target.value })} placeholder="Ex : Chef de projet" className={`${champ} mt-1`} />
                <ErreurChamp message={erreurs.titre} />
              </label>
              <label className="text-sm">Organisation
                <input value={f.organisation ?? ""} onChange={(e) => setF({ ...f, organisation: e.target.value })} className={`${champ} mt-1`} />
                <ErreurChamp message={erreurs.organisation} />
              </label>
              <label className="text-sm">Années d&apos;expérience
                <input type="number" min={1} max={60} value={f.experience ?? ""} onChange={(e) => setF({ ...f, experience: e.target.value === "" ? undefined : Number(e.target.value) })} className={`${champ} mt-1`} />
                <ErreurChamp message={erreurs.experience} />
              </label>
            </div>
            <label className="block text-sm">Langues (séparées par des virgules)
              <input value={langues} onChange={(e) => setLangues(e.target.value)} className={`${champ} mt-1`} />
              <ErreurChamp message={erreurs.langues} />
            </label>
            <label className="block text-sm">Disponibilités (ex : Lun 18:00, Sam 10:00)
              <input value={dispos} onChange={(e) => setDispos(e.target.value)} placeholder="Lun 18:00, Sam 10:00" className={`${champ} mt-1`} />
              <ErreurChamp message={erreurs.disponibilites} />
            </label>
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
              <p className="mb-1 text-sm font-semibold">Charte d&apos;engagement du mentor</p>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-slate-600 dark:text-slate-400">
                {charteMentor.map((c) => <li key={c}>{c}</li>)}
              </ul>
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={Boolean(f.charteAcceptee)} onChange={(e) => setF({ ...f, charteAcceptee: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
                J&apos;accepte la charte (obligatoire pour être mentor)
              </label>
              <ErreurChamp message={erreurs.charteAcceptee} />
            </div>
          </Carte>
        )}

        <Carte className="space-y-4">
          <div>
            <p className="mb-2 font-semibold">{mentor ? "Mes domaines d'expertise" : "Domaines dans lesquels je souhaite être accompagné"}</p>
            <div className="flex flex-wrap gap-2">
              {domaines.map((d) => (
                <button type="button" key={d.id} onClick={() => basculerDomaine(d.id)} className={`rounded-full border px-3 py-1 text-sm ${f.domaines.includes(d.id) ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                  {d.icone} {d.nom}
                </button>
              ))}
            </div>
            <ErreurChamp message={erreurs.domaines} />
          </div>
          {!mentor && (
            <div>
              <p className="mb-2 text-sm">Mes attentes</p>
              <div className="flex flex-wrap gap-2">
                {attentesProgramme.map((a) => {
                  const actif = f.attentes?.includes(a.id) ?? false;
                  return (
                    <button type="button" key={a.id} onClick={() => setF({ ...f, attentes: actif ? (f.attentes ?? []).filter((x) => x !== a.id) : [...(f.attentes ?? []), a.id] })} className={`rounded-full border px-3 py-1 text-xs ${actif ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                      {a.label}
                    </button>
                  );
                })}
              </div>
              <ErreurChamp message={erreurs.attentes} />
            </div>
          )}
          <label className="block text-sm">{mentor ? "Compétences que je peux transmettre" : "Compétences que j'ai ou que je veux développer"} (séparées par des virgules)
            <input value={competences} onChange={(e) => setCompetences(e.target.value)} className={`${champ} mt-1`} placeholder="Ex : Prise de parole en public, Business plan…" />
            <ErreurChamp message={erreurs.competences} />
          </label>
          <label className="block text-sm">{mentor ? "Présentation : mon parcours et ce que je peux apporter" : "Mes besoins et mes objectifs"}
            <textarea value={f.besoins} onChange={(e) => setF({ ...f, besoins: e.target.value })} rows={4} className={`${champ} mt-1`} />
            <span className="mt-1 block text-right text-xs text-slate-400">{f.besoins.trim().length} / 1000</span>
            <ErreurChamp message={erreurs.besoins} />
          </label>
        </Carte>

        {nbErreurs > 0 && (
          <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
            {erreurs.formulaire ?? `${nbErreurs} champ${nbErreurs > 1 ? "s" : ""} à corriger avant d'enregistrer.`}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={envoi} className={bouton}>{envoi ? "Enregistrement…" : mentor ? (monIdMentor ? "Mettre à jour mon profil de mentor" : "Publier mon profil de mentor") : "Enregistrer"}</button>
          {monIdMentor && <Link href={`/mentors/${monIdMentor}`} className={boutonSecondaire}>Voir ma fiche publique</Link>}
          {ok && <span className="text-sm text-emerald-600">✓ {ok}</span>}
          {mode === "demo" && <button type="button" onClick={() => { if (confirm("Réinitialiser toutes les données de démo ?")) reinitialiser(); }} className={`${boutonSecondaire} ml-auto`}>Réinitialiser la démo</button>}
        </div>
      </form>
    </div>
  );
}
