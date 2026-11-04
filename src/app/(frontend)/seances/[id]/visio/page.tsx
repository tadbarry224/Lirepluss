"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { lienVisio } from "@/shared/data";
import { formatDate, useStore } from "@/frontend/store";
import { Avatar, Carte, bouton, boutonSecondaire, champ } from "@/frontend/components/ui";

export default function SalleVisio() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { seances, personnes, majSeance, messages, envoyerMessage, pret } = useStore();
  const [texte, setTexte] = useState("");

  if (!pret) return null;
  const seance = seances.find((s) => s.id === id);
  const mentor = personnes.find((m) => m.id === seance?.mentorId);
  if (!seance || !mentor) {
    return (
      <div className="py-20 text-center">
        <p>Séance introuvable.</p>
        <Link href="/seances" className="text-emerald-600 underline">Retour aux séances</Link>
      </div>
    );
  }

  const lien = lienVisio(seance.id);
  const fil = messages.filter((m) => m.mentorId === mentor.id).slice(-6);

  function terminer() {
    majSeance(seance!.id, { statut: "terminee" });
    router.push("/seances");
  }

  return (
    <div className="space-y-4">
      <Link href="/seances" className="text-sm text-slate-500 hover:underline">← Mes séances</Link>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar mentor={mentor} />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">{seance.sujet}</h1>
          <p className="text-sm text-slate-500">Séance en visio avec {mentor.nom} · {formatDate(seance.date, true)}</p>
        </div>
        <a href={lien} target="_blank" rel="noopener noreferrer" className={boutonSecondaire}>Ouvrir dans un nouvel onglet ↗</a>
        <button onClick={terminer} className={bouton}>Terminer et évaluer</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-slate-800">
          <iframe
            src={`${lien}#config.prejoinPageEnabled=true&config.defaultLanguage="fr"`}
            title={`Visio avec ${mentor.nom}`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="aspect-video h-full min-h-[420px] w-full"
          />
        </div>

        <Carte className="flex flex-col">
          <h2 className="mb-2 font-semibold">💬 Chat de la séance</h2>
          <div className="flex-1 space-y-2 overflow-y-auto text-sm">
            {fil.map((m) => (
              <p key={m.id} className={`rounded-xl px-3 py-2 ${m.auteur === "moi" ? "ml-6 bg-emerald-600 text-white" : "mr-6 bg-slate-100 dark:bg-slate-800"}`}>{m.texte}</p>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!texte.trim()) return;
              envoyerMessage(mentor.id, texte.trim());
              setTexte("");
            }}
            className="mt-3 flex gap-2"
          >
            <input value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Partager un lien, une note…" className={champ} />
            <button className={bouton}>↑</button>
          </form>
        </Carte>
      </div>

      <p className="text-xs text-slate-500">
        La visio utilise Jitsi Meet (gratuit, sans installation). Autorisez la caméra et le micro quand le navigateur le demande.
        Le mentor rejoint la même salle depuis sa propre séance.
      </p>
    </div>
  );
}
