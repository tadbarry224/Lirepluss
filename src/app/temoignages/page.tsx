"use client";

import Link from "next/link";
import { domaineNom } from "@/lib/data";
import { formatDate, useStore } from "@/lib/store";
import { Avatar, Badge, Carte, Etoiles, Titre, bouton } from "@/components/ui";

/** Étape 7 du programme (TDR §10) : restitution des expériences de mentorat. */
export default function Temoignages() {
  const { temoignages, personnes, seances } = useStore();
  const seancesTerminees = seances.filter((s) => s.statut === "terminee").length;
  const noteMoyenne = temoignages.length ? temoignages.reduce((a, t) => a + t.note, 0) / temoignages.length : 0;

  return (
    <div>
      <Titre
        titre="Retours d'expérience"
        sousTitre="Ce que les mentorés ont appris, réalisé et transmis grâce au mentorat."
        action={<Link href="/seances" className={bouton}>Partager mon expérience</Link>}
      />

      <div className="mb-8 grid grid-cols-3 gap-4">
        <Carte>
          <p className="text-3xl font-bold">{temoignages.length}</p>
          <p className="text-sm text-slate-500">témoignages</p>
        </Carte>
        <Carte>
          <p className="text-3xl font-bold">{noteMoyenne ? noteMoyenne.toFixed(1) : "–"} <span className="text-amber-400">★</span></p>
          <p className="text-sm text-slate-500">satisfaction moyenne</p>
        </Carte>
        <Carte>
          <p className="text-3xl font-bold">{seancesTerminees}</p>
          <p className="text-sm text-slate-500">séances réalisées (moi)</p>
        </Carte>
      </div>

      <div className="columns-1 gap-4 md:columns-2">
        {temoignages.map((t) => {
          const mentor = personnes.find((p) => p.id === t.mentorId);
          return (
            <Carte key={t.id} className="mb-4 break-inside-avoid">
              <Etoiles note={t.note} />
              <blockquote className="mt-2 leading-relaxed">« {t.texte} »</blockquote>
              <p className="mt-3 text-sm font-semibold">{t.auteurNom} <span className="font-normal text-slate-500">· {t.auteurNiveau} · {formatDate(t.date)}</span></p>
              {mentor && (
                <Link href={`/mentors/${mentor.id}`} className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-sm hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800">
                  <Avatar mentor={mentor} taille="sm" />
                  <span>Mentor : <strong>{mentor.nom}</strong></span>
                  {mentor.domaines[0] && <span className="ml-auto hidden sm:inline"><Badge>{domaineNom(mentor.domaines[0])}</Badge></span>}
                </Link>
              )}
            </Carte>
          );
        })}
      </div>
      {temoignages.length === 0 && <p className="py-10 text-center text-slate-500">Aucun témoignage pour l&apos;instant.</p>}
    </div>
  );
}
