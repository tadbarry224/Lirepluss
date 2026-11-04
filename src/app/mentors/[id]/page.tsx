"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { domaineNom, domaines, ressources } from "@/lib/data";
import { noteMoyenne, scoreCompatibilite } from "@/lib/matching";
import { formatDate, useStore } from "@/lib/store";
import type { Seance } from "@/lib/types";
import { Avatar, Badge, Carte, Etoiles, bouton, boutonSecondaire, champ } from "@/components/ui";

const jours: Record<string, number> = { Dim: 0, Lun: 1, Mar: 2, Mer: 3, Jeu: 4, Ven: 5, Sam: 6 };

/** Prochaines dates réelles correspondant aux créneaux "Lun 18:00" du mentor. */
function prochainsCreneaux(dispos: string[], nombre = 6) {
  const res: Date[] = [];
  const now = new Date();
  for (let i = 1; i <= 21 && res.length < nombre; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    for (const dispo of dispos) {
      const [j, h] = dispo.split(" ");
      if (jours[j] === d.getDay()) {
        const [hh, mm] = h.split(":").map(Number);
        const c = new Date(d);
        c.setHours(hh, mm, 0, 0);
        res.push(c);
      }
    }
  }
  return res.slice(0, nombre);
}

export default function ProfilMentor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profil, seances, reserver, favoris, basculerFavori, envoyerMessage, tousMentors: mentors, pret } = useStore();
  const mentor = mentors.find((m) => m.id === id);
  const [creneau, setCreneau] = useState<string>("");
  const [sujet, setSujet] = useState("");
  const [format, setFormat] = useState<Seance["format"]>("Visio");
  const [confirme, setConfirme] = useState(false);

  if (!pret) return null;
  if (!mentor) {
    return (
      <div className="py-20 text-center">
        <p>Mentor introuvable.</p>
        <Link href="/mentors" className="text-emerald-600 underline">Retour</Link>
      </div>
    );
  }

  const compat = scoreCompatibilite(profil, mentor, seances);
  const note = noteMoyenne(mentor.id, seances);
  const avis = seances.filter((s) => s.mentorId === mentor.id && s.note);
  const sesRessources = ressources.filter((r) => r.auteur === mentor.nom);
  const creneaux = prochainsCreneaux(mentor.disponibilites);

  function valider(e: React.FormEvent) {
    e.preventDefault();
    if (!creneau || !sujet.trim()) return;
    reserver({ mentorId: mentor!.id, date: creneau, sujet, format });
    envoyerMessage(mentor!.id, `Bonjour ${mentor!.nom.split(" ").slice(-1)[0]}, je viens de réserver une séance le ${formatDate(creneau, true)} sur « ${sujet} ». Merci d'avance !`);
    setConfirme(true);
  }

  return (
    <div className="space-y-6">
      <Link href="/mentors" className="text-sm text-slate-500 hover:underline">← Tous les mentors</Link>

      <Carte>
        <div className="flex flex-wrap items-start gap-5">
          <Avatar mentor={mentor} taille="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{mentor.nom}</h1>
            <p className="text-slate-600 dark:text-slate-400">{mentor.titre} · {mentor.organisation}</p>
            <p className="mt-1 text-sm text-slate-500">📍 {mentor.ville} · {mentor.experience} ans d&apos;expérience · 🗣️ {mentor.langues.join(", ")}</p>
            {note && <div className="mt-2 flex items-center gap-2"><Etoiles note={Math.round(note)} /><span className="text-sm text-slate-500">{note.toFixed(1)} ({avis.length} avis)</span></div>}
          </div>
          <div className="flex gap-2">
            <button onClick={() => basculerFavori(mentor.id)} className={boutonSecondaire}>{favoris.includes(mentor.id) ? "★ Favori" : "☆ Favori"}</button>
            <Link href={`/messages?mentor=${mentor.id}`} className={boutonSecondaire}>💬 Écrire</Link>
          </div>
        </div>
        <p className="mt-5 leading-relaxed">{mentor.bio}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {mentor.domaines.map((d) => <Badge key={d} ton="vert">{domaineNom(d)}</Badge>)}
          {mentor.competences.map((c) => <Badge key={c}>{c}</Badge>)}
        </div>
        {mentor.domaines.map((d) => domaines.find((x) => x.id === d)?.avertissement).filter(Boolean).map((a) => (
          <p key={a} className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">ℹ️ {a}</p>
        ))}
        <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">✨ Compatibilité avec votre profil : <strong>{compat.score}%</strong> — {compat.raison}</p>
      </Carte>

      <div className="grid gap-6 lg:grid-cols-2">
        <Carte>
          <h2 className="mb-4 text-lg font-semibold">📅 Réserver une séance</h2>
          {confirme ? (
            <div className="space-y-3 text-center">
              <p className="text-4xl">🎉</p>
              <p className="font-medium">Séance réservée le {formatDate(creneau, true)} !</p>
              <p className="text-sm text-slate-500">Un message a été envoyé à {mentor.nom}.</p>
              <button onClick={() => router.push("/seances")} className={bouton}>Voir mes séances</button>
            </div>
          ) : (
            <form onSubmit={valider} className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Créneaux disponibles</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {creneaux.map((c) => (
                    <button
                      type="button"
                      key={c.toISOString()}
                      onClick={() => setCreneau(c.toISOString())}
                      className={`rounded-xl border px-2 py-2 text-xs font-medium ${creneau === c.toISOString() ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 hover:border-emerald-500 dark:border-slate-700"}`}
                    >
                      {formatDate(c.toISOString(), true)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Format de la séance</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["Visio", "🎥", "Dans l'appli"],
                    ["Chat", "💬", "Par messages"],
                    ["Présentiel", "🤝", "Sur place"],
                  ] as const).map(([f, icone, aide]) => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setFormat(f)}
                      className={`rounded-xl border px-2 py-2 text-center text-xs ${format === f ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 dark:border-slate-700"}`}
                    >
                      <span className="block text-lg">{icone}</span>
                      <span className="font-semibold">{f}</span>
                      <span className="block text-slate-500">{aide}</span>
                    </button>
                  ))}
                </div>
              </div>
              <input value={sujet} onChange={(e) => setSujet(e.target.value)} placeholder="Sujet de la séance (ex : préparer mon entretien)" className={champ} />
              <button disabled={!creneau || !sujet.trim()} className={`${bouton} w-full`}>Confirmer la réservation</button>
            </form>
          )}
        </Carte>

        <div className="space-y-6">
          <Carte>
            <h2 className="mb-3 text-lg font-semibold">💬 Avis des mentorés</h2>
            {avis.length === 0 && <p className="text-sm text-slate-500">Pas encore d&apos;avis.</p>}
            {avis.map((s) => (
              <div key={s.id} className="border-b border-slate-100 py-2 last:border-0 dark:border-slate-800">
                <Etoiles note={s.note!} />
                <p className="mt-1 text-sm">{s.commentaire}</p>
              </div>
            ))}
          </Carte>
          {sesRessources.length > 0 && (
            <Carte>
              <h2 className="mb-3 text-lg font-semibold">📚 Ressources partagées</h2>
              {sesRessources.map((r) => (
                <p key={r.id} className="py-1 text-sm"><Badge ton="bleu">{r.type}</Badge> {r.titre}</p>
              ))}
            </Carte>
          )}
        </div>
      </div>
    </div>
  );
}
