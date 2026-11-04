"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate, useStore } from "@/frontend/store";
import type { Seance } from "@/shared/types";
import { Avatar, Badge, Carte, Etoiles, Titre, bouton, boutonSecondaire, champ } from "@/frontend/components/ui";

/**
 * Après une séance : évaluation (§7.2), plan d'action pour « mettre en pratique les conseils reçus » (§12)
 * et témoignage public pour la restitution des expériences (§10, étape 7).
 */
function Evaluation({ seance }: { seance: Seance }) {
  const { majSeance, ajouterObjectif, publierTemoignage } = useStore();
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [actions, setActions] = useState("");
  const [partager, setPartager] = useState(true);
  const [envoye, setEnvoye] = useState("");

  if (seance.note) {
    return (
      <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
        <Etoiles note={seance.note} />
        {seance.commentaire && <p className="mt-1 text-sm italic">« {seance.commentaire} »</p>}
        {envoye && <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-400">✓ {envoye}</p>}
      </div>
    );
  }

  function envoyer() {
    majSeance(seance.id, { note, commentaire });
    const etapes = actions.split("\n").map((a) => a.trim()).filter(Boolean);
    const faits: string[] = ["Avis envoyé"];
    if (etapes.length) {
      const echeance = new Date();
      echeance.setDate(echeance.getDate() + 30);
      ajouterObjectif({
        titre: `Plan d'action : ${seance.sujet}`,
        echeance: echeance.toISOString(),
        mentorId: seance.mentorId,
        etapes: etapes.map((t, i) => ({ id: `${Date.now()}-${i}`, titre: t, fait: false })),
      });
      faits.push("plan d'action ajouté à vos objectifs");
    }
    if (partager && commentaire.trim().length >= 10) {
      publierTemoignage({ mentorId: seance.mentorId, texte: commentaire.trim(), note });
      faits.push("témoignage publié");
    }
    setEnvoye(faits.join(", ") + ".");
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20">
      <div>
        <p className="text-sm font-medium">1. Évaluez cette séance</p>
        <Etoiles note={note} onChange={setNote} />
      </div>
      <label className="block text-sm font-medium">2. Qu&apos;avez-vous appris ?
        <textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} rows={2} placeholder="Ce que cette séance vous a apporté…" className={`${champ} mt-1 font-normal`} />
      </label>
      <label className="block text-sm font-medium">3. Ce que je vais mettre en pratique <span className="font-normal text-slate-500">(une action par ligne, optionnel)</span>
        <textarea value={actions} onChange={(e) => setActions(e.target.value)} rows={3} placeholder={"Refaire mon CV avec le modèle conseillé\nContacter 3 entreprises cette semaine"} className={`${champ} mt-1 font-normal`} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={partager} onChange={(e) => setPartager(e.target.checked)} className="accent-emerald-600" />
        Publier mon retour comme témoignage pour inspirer les autres
      </label>
      <button disabled={!note} onClick={envoyer} className={bouton}>Envoyer</button>
    </div>
  );
}

export default function Seances() {
  const { seances, majSeance, personnes: mentors } = useStore();
  const [onglet, setOnglet] = useState<"avenir" | "passees">("avenir");
  const maintenant = new Date().toISOString();
  const liste = seances
    .filter((s) => (onglet === "avenir" ? s.statut === "planifiee" && s.date >= maintenant : s.statut !== "planifiee" || s.date < maintenant))
    .sort((a, b) => (onglet === "avenir" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

  const statut = (s: Seance) =>
    s.statut === "annulee" ? <Badge ton="rouge">Annulée</Badge> : s.statut === "terminee" ? <Badge ton="vert">Terminée</Badge> : <Badge ton="bleu">Planifiée</Badge>;

  return (
    <div>
      <Titre titre="Mes séances de mentorat" sousTitre="Planifiez, suivez et évaluez vos séances." action={<Link href="/mentors" className={bouton}>+ Nouvelle séance</Link>} />
      <div className="mb-6 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
        {(["avenir", "passees"] as const).map((o) => (
          <button key={o} onClick={() => setOnglet(o)} className={`rounded-lg px-4 py-1.5 text-sm font-medium ${onglet === o ? "bg-white shadow dark:bg-slate-800" : "text-slate-500"}`}>
            {o === "avenir" ? "À venir" : "Historique"}
          </button>
        ))}
      </div>
      <div className="space-y-4">
        {liste.length === 0 && <p className="py-10 text-center text-slate-500">Aucune séance ici.</p>}
        {liste.map((s) => {
          const m = mentors.find((x) => x.id === s.mentorId);
          if (!m) return null;
          return (
            <Carte key={s.id}>
              <div className="flex flex-wrap items-center gap-4">
                <Avatar mentor={m} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.sujet}</p>
                  <p className="text-sm text-slate-500">avec <Link href={`/mentors/${m.id}`} className="hover:underline">{m.nom}</Link> · {formatDate(s.date, true)} · {s.format}</p>
                </div>
                {statut(s)}
              </div>
              {onglet === "avenir" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.format === "Visio" && <Link href={`/seances/${s.id}/visio`} className={bouton}>🎥 Rejoindre la visio</Link>}
                  {s.format === "Chat" && <Link href={`/messages?mentor=${m.id}`} className={bouton}>💬 Ouvrir le chat</Link>}
                  <button onClick={() => majSeance(s.id, { statut: "terminee" })} className={boutonSecondaire}>Marquer comme terminée</button>
                  <button onClick={() => majSeance(s.id, { statut: "annulee" })} className={boutonSecondaire}>Annuler</button>
                </div>
              )}
              {s.statut === "terminee" && !s.jeSuisLeMentor && <Evaluation seance={s} />}
            </Carte>
          );
        })}
      </div>
    </div>
  );
}
