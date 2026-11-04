"use client";

import Link from "next/link";
import { useState } from "react";
import { formatDate, useStore } from "@/lib/store";
import type { Seance } from "@/lib/types";
import { Avatar, Badge, Carte, Etoiles, Titre, bouton, boutonSecondaire, champ } from "@/components/ui";

function Evaluation({ seance }: { seance: Seance }) {
  const { majSeance } = useStore();
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  if (seance.note) {
    return (
      <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
        <Etoiles note={seance.note} />
        {seance.commentaire && <p className="mt-1 text-sm italic">« {seance.commentaire} »</p>}
      </div>
    );
  }
  return (
    <div className="mt-3 space-y-2 rounded-xl bg-amber-50 p-3 dark:bg-amber-950/20">
      <p className="text-sm font-medium">Évaluez cette séance</p>
      <Etoiles note={note} onChange={setNote} />
      <input value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Qu'avez-vous appris ? (optionnel)" className={champ} />
      <button disabled={!note} onClick={() => majSeance(seance.id, { note, commentaire })} className={bouton}>Envoyer mon avis</button>
    </div>
  );
}

export default function Seances() {
  const { seances, majSeance, tousMentors: mentors } = useStore();
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
          const m = mentors.find((x) => x.id === s.mentorId)!;
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
              {s.statut === "terminee" && <Evaluation seance={s} />}
            </Carte>
          );
        })}
      </div>
    </div>
  );
}
