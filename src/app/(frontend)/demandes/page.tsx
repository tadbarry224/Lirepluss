"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar, Badge, Carte, ErreurChamp, Titre, bouton, boutonSecondaire, champ } from "@/frontend/components/ui";
import { formatDate, useStore } from "@/frontend/store";
import { domaineNom } from "@/shared/data";
import type { DemandeMentorat } from "@/shared/types";

/** Étape 3 du programme (TDR §10) : mise en relation entre mentors et participants. */
export default function Demandes() {
  const { demandes, monIdMentor, pret } = useStore();
  if (!pret) return null;

  const recues = demandes.filter((d) => d.jeSuisLeMentor);
  const enAttente = recues.filter((d) => d.statut === "en_attente");
  const envoyees = demandes.filter((d) => !d.jeSuisLeMentor);

  return (
    <div className="space-y-8">
      <Titre titre="Mises en relation" sousTitre="Le mentorat commence par une demande : le mentoré se présente, le mentor accepte de l'accompagner." />

      {(monIdMentor || recues.length > 0) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">
            Demandes reçues {enAttente.length > 0 && <Badge ton="ambre">{enAttente.length} en attente</Badge>}
          </h2>
          <div className="space-y-4">
            {recues.length === 0 && <p className="text-sm text-slate-500">Aucune demande pour l&apos;instant. Vérifiez que votre profil de mentor est complet pour être bien recommandé.</p>}
            {recues.map((d) => <CarteDemande key={d.id} demande={d} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold">Mes demandes de mentorat</h2>
        <div className="space-y-4">
          {envoyees.length === 0 && (
            <Carte className="text-center">
              <p className="text-sm text-slate-500">Vous n&apos;avez encore demandé aucun mentor.</p>
              <Link href="/mentors" className={`${bouton} mt-3`}>Trouver un mentor</Link>
            </Carte>
          )}
          {envoyees.map((d) => <CarteDemande key={d.id} demande={d} />)}
        </div>
      </section>
    </div>
  );
}

const statuts = {
  en_attente: <Badge ton="ambre">⏳ En attente</Badge>,
  acceptee: <Badge ton="vert">✓ Acceptée</Badge>,
  refusee: <Badge ton="rouge">Non retenue</Badge>,
};

function CarteDemande({ demande: d }: { demande: DemandeMentorat }) {
  const { personnes, repondreDemande } = useStore();
  const [reponse, setReponse] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const personne = personnes.find((p) => p.id === d.interlocuteurId);
  if (!personne) return null;

  async function repondre(statut: "acceptee" | "refusee") {
    setEnvoi(true);
    const r = await repondreDemande(d.id, statut, reponse);
    setEnvoi(false);
    setErreur(r.ok ? "" : r.erreur);
  }

  return (
    <Carte>
      <div className="flex flex-wrap items-center gap-3">
        <Avatar mentor={personne} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{personne.nom}</p>
          <p className="text-xs text-slate-500">
            {d.jeSuisLeMentor ? `${personne.titre}${personne.ville ? ` · ${personne.ville}` : ""}` : `${personne.titre} · ${personne.domaines.map(domaineNom).slice(0, 2).join(", ")}`} · {formatDate(d.date)}
          </p>
        </div>
        {statuts[d.statut]}
      </div>
      <p className="mt-3 text-sm"><span className="font-medium">Objectif :</span> {d.objectif}</p>
      <p className="mt-1 rounded-xl bg-slate-50 p-3 text-sm italic dark:bg-slate-800/50">« {d.message} »</p>
      {d.reponse && (
        <p className="mt-2 text-sm"><span className="font-medium">{d.jeSuisLeMentor ? "Votre réponse" : "Réponse du mentor"} :</span> {d.reponse}</p>
      )}

      {d.jeSuisLeMentor && d.statut === "en_attente" && (
        <div className="mt-3 space-y-2">
          <textarea value={reponse} onChange={(e) => setReponse(e.target.value)} rows={2} maxLength={500} placeholder="Un mot pour le mentoré (optionnel)" className={champ} />
          <div className="flex flex-wrap gap-2">
            <button disabled={envoi} onClick={() => repondre("acceptee")} className={bouton}>Accepter de l&apos;accompagner</button>
            <button disabled={envoi} onClick={() => repondre("refusee")} className={boutonSecondaire}>Décliner</button>
          </div>
          <ErreurChamp message={erreur} />
        </div>
      )}

      {d.statut === "acceptee" && (
        <div className="mt-3 flex flex-wrap gap-2">
          {!d.jeSuisLeMentor && <Link href={`/mentors/${personne.id}`} className={bouton}>Réserver une séance</Link>}
          <Link href={`/messages?mentor=${personne.id}`} className={boutonSecondaire}>💬 Écrire</Link>
        </div>
      )}
    </Carte>
  );
}
