"use client";

import Link from "next/link";
import { useState } from "react";
import { domaineNom, domaines, lienVisio } from "@/lib/data";
import { formatDate, useStore } from "@/lib/store";
import { Avatar, Badge, Barre, Carte, Titre, bouton, boutonSecondaire, champ } from "@/components/ui";

/** Étape 4 du programme (TDR §10) : sessions de mentorat et ateliers thématiques. */
export default function Ateliers() {
  const { ateliers, mesAteliers, basculerInscriptionAtelier, personnes } = useStore();
  const [domaine, setDomaine] = useState("");
  const [mesSeuls, setMesSeuls] = useState(false);
  const [maintenant] = useState(() => Date.now());

  const liste = ateliers
    .filter((a) => (!domaine || a.domaine === domaine) && (!mesSeuls || mesAteliers.includes(a.id)))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <Titre
        titre="Ateliers thématiques"
        sousTitre="Des séances collectives animées par les mentors pour apprendre ensemble et partager les expériences."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select value={domaine} onChange={(e) => setDomaine(e.target.value)} className={`${champ} sm:w-80`}>
          <option value="">Tous les domaines</option>
          {domaines.map((d) => <option key={d.id} value={d.id}>{d.icone} {d.nom}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={mesSeuls} onChange={(e) => setMesSeuls(e.target.checked)} className="accent-emerald-600" />
          Mes inscriptions ({mesAteliers.length})
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {liste.map((a) => {
          const animateur = personnes.find((p) => p.id === a.animateurId);
          const inscrit = mesAteliers.includes(a.id);
          const complet = a.inscrits >= a.places && !inscrit;
          const passe = new Date(a.date).getTime() + a.dureeMinutes * 60000 < maintenant;
          return (
            <Carte key={a.id} className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <Badge ton="vert">{domaineNom(a.domaine)}</Badge>
                <Badge ton={a.format === "Visio" ? "bleu" : "ambre"}>{a.format === "Visio" ? "🎥 Visio" : "📍 Présentiel"}</Badge>
                {inscrit && <Badge ton="vert">✓ Inscrit</Badge>}
              </div>
              <h2 className="mt-3 font-semibold">{a.titre}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-400">{a.description}</p>
              <p className="mt-3 text-sm">📅 {formatDate(a.date, true)} · {a.dureeMinutes} min · {a.lieu}</p>
              {animateur && (
                <Link href={`/mentors/${animateur.id}`} className="mt-3 flex items-center gap-2 text-sm hover:underline">
                  <Avatar mentor={animateur} taille="sm" /> Animé par <strong>{animateur.nom}</strong>
                </Link>
              )}
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>{a.inscrits} inscrit{a.inscrits > 1 ? "s" : ""}</span>
                  <span>{Math.max(0, a.places - a.inscrits)} place{a.places - a.inscrits > 1 ? "s" : ""} restante{a.places - a.inscrits > 1 ? "s" : ""}</span>
                </div>
                <Barre valeur={Math.min(100, (a.inscrits / a.places) * 100)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {passe ? (
                  <span className="text-sm text-slate-500">Atelier terminé</span>
                ) : (
                  <>
                    <button onClick={() => basculerInscriptionAtelier(a.id)} disabled={complet} className={inscrit ? boutonSecondaire : bouton}>
                      {complet ? "Complet" : inscrit ? "Me désinscrire" : "M'inscrire"}
                    </button>
                    {inscrit && a.format === "Visio" && (
                      <a href={lienVisio(`atelier-${a.id}`)} target="_blank" rel="noopener noreferrer" className={bouton}>🎥 Rejoindre la visio</a>
                    )}
                  </>
                )}
              </div>
            </Carte>
          );
        })}
      </div>
      {liste.length === 0 && <p className="py-10 text-center text-slate-500">Aucun atelier ne correspond.</p>}
    </div>
  );
}
