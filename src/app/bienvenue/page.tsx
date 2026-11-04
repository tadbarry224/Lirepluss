"use client";

import Link from "next/link";
import { useState } from "react";
import { attentesProgramme, charteMentor, domaines } from "@/lib/data";
import { recommanderLocalement } from "@/lib/matching";
import { useStore } from "@/lib/store";
import { profilsBeneficiaires, type Profil, type Seance } from "@/lib/types";
import { Barre, Carte, CarteMentor, bouton, boutonSecondaire, champ } from "@/components/ui";

/**
 * Étape 1 du programme (TDR §10) : identification des besoins et des attentes des participants.
 * Questionnaire en 4 étapes qui remplit le profil puis propose des mentors.
 */
export default function Bienvenue() {
  const { pret } = useStore();
  if (!pret) return null;
  return <Questionnaire />;
}

const formats: { id: Seance["format"]; icone: string; aide: string }[] = [
  { id: "Visio", icone: "🎥", aide: "En vidéo dans l'appli" },
  { id: "Chat", icone: "💬", aide: "Par messages écrits" },
  { id: "Présentiel", icone: "🤝", aide: "Rencontre sur place" },
];

function Questionnaire() {
  const { profil, majProfil, publierProfilMentor, tousMentors, seances } = useStore();
  const [etape, setEtape] = useState(0);
  const [f, setF] = useState<Profil>({ ...profil, attentes: profil.attentes ?? [], formatPrefere: profil.formatPrefere ?? "Visio" });
  const [termine, setTermine] = useState(false);
  const mentor = f.role === "mentor";

  const basculer = (cle: "domaines" | "attentes", id: string) => {
    const liste = f[cle] ?? [];
    setF({ ...f, [cle]: liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id] });
  };

  const etapes = [
    { titre: "Qui êtes-vous ?", valide: f.nom.trim().length > 1 },
    { titre: mentor ? "Vos domaines d'expertise" : "Dans quels domaines souhaitez-vous être accompagné ?", valide: f.domaines.length > 0 },
    { titre: mentor ? "Votre engagement de mentor" : "Qu'attendez-vous du mentorat ?", valide: mentor ? Boolean(f.charteAcceptee) : (f.attentes?.length ?? 0) > 0 && f.besoins.trim().length > 10 },
    { titre: "Comment préférez-vous échanger ?", valide: Boolean(f.formatPrefere) },
  ];

  function terminer() {
    if (mentor) publierProfilMentor(f);
    else majProfil(f);
    setTermine(true);
  }

  if (termine) {
    const recos = recommanderLocalement(f, tousMentors, seances).slice(0, 3);
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Carte className="text-center">
          <p className="text-4xl">🎉</p>
          <h1 className="mt-2 text-2xl font-bold">Merci {f.nom} !</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {mentor ? "Votre fiche de mentor est publiée : les mentorés peuvent maintenant vous trouver et réserver une séance." : "Vos besoins sont enregistrés. Voici les mentors qui correspondent le mieux à votre profil."}
          </p>
        </Carte>
        {!mentor && (
          <div className="grid gap-4">
            {recos.map((r) => {
              const m = tousMentors.find((x) => x.id === r.mentorId);
              return m ? <CarteMentor key={m.id} mentor={m} extra={<p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">✨ {r.score}% compatible — {r.raison}</p>} /> : null;
            })}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <Link href={mentor ? "/seances" : "/mentors"} className={bouton}>{mentor ? "Voir mes séances" : "Voir tous les mentors"}</Link>
          <Link href={mentor ? "/ateliers" : "/objectifs"} className={boutonSecondaire}>{mentor ? "Les ateliers thématiques" : "Construire mon parcours avec l'IA"}</Link>
        </div>
      </div>
    );
  }

  const courant = etapes[etape];

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Étape 1 du programme · Identification des besoins</p>
      <div className="my-3 flex items-center gap-3">
        <Barre valeur={((etape + 1) / etapes.length) * 100} />
        <span className="shrink-0 text-xs text-slate-500">{etape + 1} / {etapes.length}</span>
      </div>
      <h1 className="mb-6 text-2xl font-bold">{courant.titre}</h1>

      <Carte className="space-y-4">
        {etape === 0 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {(["mentore", "mentor"] as const).map((r) => (
                <button type="button" key={r} onClick={() => setF({ ...f, role: r, niveau: r === "mentor" ? "Professionnel expérimenté" : f.niveau === "Professionnel expérimenté" ? "Étudiant" : f.niveau })} className={`rounded-xl border p-4 text-left ${f.role === r ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 dark:border-slate-700"}`}>
                  <p className="text-2xl">{r === "mentore" ? "🌱" : "🧑‍🏫"}</p>
                  <p className="mt-1 font-semibold">{r === "mentore" ? "Je cherche un mentor" : "Je veux transmettre"}</p>
                </button>
              ))}
            </div>
            <label className="block text-sm">Nom complet<input value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} className={`${champ} mt-1`} /></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Ville<input value={f.ville} onChange={(e) => setF({ ...f, ville: e.target.value })} className={`${champ} mt-1`} /></label>
              <label className="text-sm">Je suis
                <select value={f.niveau} onChange={(e) => setF({ ...f, niveau: e.target.value as Profil["niveau"] })} className={`${champ} mt-1`}>
                  {profilsBeneficiaires.map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
            </div>
            {mentor && (
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm">Poste<input value={f.titre ?? ""} onChange={(e) => setF({ ...f, titre: e.target.value })} className={`${champ} mt-1`} /></label>
                <label className="text-sm">Organisation<input value={f.organisation ?? ""} onChange={(e) => setF({ ...f, organisation: e.target.value })} className={`${champ} mt-1`} /></label>
                <label className="text-sm">Années d&apos;expérience<input type="number" min={1} value={f.experience ?? 1} onChange={(e) => setF({ ...f, experience: Number(e.target.value) })} className={`${champ} mt-1`} /></label>
              </div>
            )}
          </>
        )}

        {etape === 1 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {domaines.map((d) => (
              <button type="button" key={d.id} onClick={() => basculer("domaines", d.id)} className={`flex items-start gap-3 rounded-xl border p-3 text-left ${f.domaines.includes(d.id) ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 dark:border-slate-700"}`}>
                <span className="text-2xl">{d.icone}</span>
                <span>
                  <span className="block text-sm font-semibold">{d.nom}</span>
                  <span className="block text-xs text-slate-500">{d.description}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {etape === 2 && !mentor && (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">Choisissez une ou plusieurs attentes :</p>
            <div className="grid gap-2">
              {attentesProgramme.map((a) => (
                <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${f.attentes?.includes(a.id) ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 dark:border-slate-700"}`}>
                  <input type="checkbox" checked={f.attentes?.includes(a.id) ?? false} onChange={() => basculer("attentes", a.id)} className="mt-1 h-4 w-4 accent-emerald-600" />
                  <span>
                    <span className="block text-sm font-medium">{a.label}</span>
                    <span className="block text-xs text-slate-500">{a.axe}</span>
                  </span>
                </label>
              ))}
            </div>
            <label className="block text-sm">Décrivez votre situation et ce que vous souhaitez atteindre
              <textarea value={f.besoins} onChange={(e) => setF({ ...f, besoins: e.target.value })} rows={4} className={`${champ} mt-1`} placeholder="Ex : je suis en licence d'informatique et je veux créer une application pour les agriculteurs…" />
            </label>
          </>
        )}

        {etape === 2 && mentor && (
          <>
            <label className="block text-sm">Présentez votre parcours et ce que vous pouvez apporter
              <textarea value={f.besoins} onChange={(e) => setF({ ...f, besoins: e.target.value })} rows={4} className={`${champ} mt-1`} />
            </label>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
              <p className="mb-2 text-sm font-semibold">Charte d&apos;engagement du mentor</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {charteMentor.map((c) => <li key={c}>{c}</li>)}
              </ul>
              <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={Boolean(f.charteAcceptee)} onChange={(e) => setF({ ...f, charteAcceptee: e.target.checked })} className="h-4 w-4 accent-emerald-600" />
                J&apos;accepte la charte d&apos;engagement du mentor
              </label>
            </div>
          </>
        )}

        {etape === 3 && (
          <>
            <div className="grid grid-cols-3 gap-2">
              {formats.map((x) => (
                <button type="button" key={x.id} onClick={() => setF({ ...f, formatPrefere: x.id })} className={`rounded-xl border p-3 text-center ${f.formatPrefere === x.id ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 dark:border-slate-700"}`}>
                  <span className="block text-2xl">{x.icone}</span>
                  <span className="block text-sm font-semibold">{x.id}</span>
                  <span className="block text-xs text-slate-500">{x.aide}</span>
                </button>
              ))}
            </div>
            <label className="block text-sm">Langues parlées (séparées par des virgules)
              <input value={(f.langues ?? ["Français"]).join(", ")} onChange={(e) => setF({ ...f, langues: e.target.value.split(",").map((l) => l.trim()) })} className={`${champ} mt-1`} />
            </label>
            {mentor && (
              <label className="block text-sm">Disponibilités (ex : Lun 18:00, Sam 10:00)
                <input value={(f.disponibilites ?? []).join(", ")} onChange={(e) => setF({ ...f, disponibilites: e.target.value.split(",").map((l) => l.trim()) })} className={`${champ} mt-1`} />
              </label>
            )}
          </>
        )}
      </Carte>

      <div className="mt-6 flex justify-between">
        <button type="button" onClick={() => setEtape(etape - 1)} disabled={etape === 0} className={`${boutonSecondaire} disabled:invisible`}>← Retour</button>
        {etape < etapes.length - 1 ? (
          <button type="button" onClick={() => setEtape(etape + 1)} disabled={!courant.valide} className={bouton}>Continuer →</button>
        ) : (
          <button type="button" onClick={terminer} disabled={!courant.valide} className={bouton}>Terminer</button>
        )}
      </div>
    </div>
  );
}
