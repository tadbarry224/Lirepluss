"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { formatDate, useStore } from "@/lib/store";
import { Avatar, Titre, bouton, champ } from "@/components/ui";

const reponsesAuto = [
  "Merci pour ton message ! Je regarde ça et je te réponds en détail avant notre prochaine séance.",
  "Très bonne question. Commence par lister tes priorités, on en discutera ensemble.",
  "Bravo pour tes progrès 👏 Continue comme ça !",
  "Je t'ai partagé une ressource utile dans la bibliothèque, jette un œil.",
];

function Messagerie() {
  const params = useSearchParams();
  const { messages, envoyerMessage, tousMentors: mentors } = useStore();
  const avecConversation = [...new Set(messages.map((m) => m.mentorId))];
  const demande = params.get("mentor");
  const [actif, setActif] = useState<string>(demande ?? avecConversation[0] ?? mentors[0].id);
  const [texte, setTexte] = useState("");
  const fin = useRef<HTMLDivElement>(null);

  const contacts = [...new Set([...(demande ? [demande] : []), ...avecConversation])]
    .map((id) => mentors.find((m) => m.id === id)!)
    .filter(Boolean);
  const fil = messages.filter((m) => m.mentorId === actif);
  const mentor = mentors.find((m) => m.id === actif)!;

  useEffect(() => fin.current?.scrollIntoView({ behavior: "smooth" }), [fil.length]);

  function envoyer(e: React.FormEvent) {
    e.preventDefault();
    if (!texte.trim()) return;
    envoyerMessage(actif, texte.trim());
    setTexte("");
    const id = actif;
    setTimeout(() => envoyerMessage(id, reponsesAuto[Math.floor(Math.random() * reponsesAuto.length)], "mentor"), 1500);
  }

  return (
    <div>
      <Titre titre="Espace d'échange" sousTitre="Discutez avec vos mentors entre les séances." />
      <div className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white md:grid-cols-[260px_1fr] dark:border-slate-800 dark:bg-slate-900">
        <ul className="max-h-40 overflow-y-auto border-b border-slate-200 md:max-h-[560px] md:border-r md:border-b-0 dark:border-slate-800">
          {contacts.map((c) => {
            const dernier = messages.filter((m) => m.mentorId === c.id).at(-1);
            return (
              <li key={c.id}>
                <button onClick={() => setActif(c.id)} className={`flex w-full items-center gap-3 p-3 text-left ${actif === c.id ? "bg-emerald-50 dark:bg-emerald-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                  <Avatar mentor={c} taille="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{c.nom}</p>
                    <p className="truncate text-xs text-slate-500">{dernier?.texte ?? "Nouvelle conversation"}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="flex h-[560px] flex-col">
          <div className="flex items-center gap-3 border-b border-slate-200 p-3 dark:border-slate-800">
            <Avatar mentor={mentor} taille="sm" />
            <div>
              <p className="text-sm font-semibold">{mentor.nom}</p>
              <p className="text-xs text-slate-500">{mentor.titre}</p>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {fil.length === 0 && <p className="text-center text-sm text-slate-500">Démarrez la conversation avec {mentor.nom}.</p>}
            {fil.map((m) => (
              <div key={m.id} className={`flex ${m.auteur === "moi" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.auteur === "moi" ? "bg-emerald-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}>
                  <p>{m.texte}</p>
                  <p className={`mt-1 text-[10px] ${m.auteur === "moi" ? "text-emerald-100" : "text-slate-500"}`}>{formatDate(m.date, true)}</p>
                </div>
              </div>
            ))}
            <div ref={fin} />
          </div>
          <form onSubmit={envoyer} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800">
            <input value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Écrire un message…" className={champ} />
            <button className={bouton}>Envoyer</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Messagerie />
    </Suspense>
  );
}
