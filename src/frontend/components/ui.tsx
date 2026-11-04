import Link from "next/link";
import { domaineNom, initiales } from "@/shared/data";
import type { Mentor } from "@/shared/types";

export function Avatar({ mentor, taille = "md" }: { mentor: Pick<Mentor, "nom" | "couleur" | "photo">; taille?: "sm" | "md" | "lg" }) {
  const t = { sm: "h-8 w-8 text-xs", md: "h-12 w-12 text-sm", lg: "h-20 w-20 text-2xl" }[taille];
  if (mentor.photo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- photo déjà redimensionnée (320 px), éventuellement encodée en mode démo
      <img src={mentor.photo} alt={`Photo de ${mentor.nom}`} className={`${t} shrink-0 rounded-full object-cover`} />
    );
  }
  return (
    <div className={`${t} ${mentor.couleur} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}>
      {initiales(mentor.nom)}
    </div>
  );
}

export function Badge({ children, ton = "gris" }: { children: React.ReactNode; ton?: "gris" | "vert" | "bleu" | "ambre" | "rouge" }) {
  const c = {
    gris: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    vert: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    bleu: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    ambre: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    rouge: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  }[ton];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${c}`}>{children}</span>;
}

export function Carte({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>{children}</div>;
}

export function Titre({ titre, sousTitre, action }: { titre: string; sousTitre?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{titre}</h1>
        {sousTitre && <p className="mt-1 text-slate-600 dark:text-slate-400">{sousTitre}</p>}
      </div>
      {action}
    </div>
  );
}

export function Etoiles({ note, onChange }: { note: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-0.5" aria-label={`Note : ${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`text-xl leading-none ${n <= note ? "text-amber-400" : "text-slate-300 dark:text-slate-600"} ${onChange ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
          aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function Barre({ valeur }: { valeur: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${valeur}%` }} />
    </div>
  );
}

export function CarteMentor({ mentor, extra, note }: { mentor: Mentor; extra?: React.ReactNode; note?: number | null }) {
  return (
    <Link href={`/mentors/${mentor.id}`} className="block transition hover:-translate-y-0.5">
      <Carte className="h-full hover:border-emerald-400">
        <div className="flex items-start gap-4">
          <Avatar mentor={mentor} />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{mentor.nom}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{mentor.titre} · {mentor.organisation}</p>
            <p className="mt-1 text-xs text-slate-500">📍 {mentor.ville} · {mentor.experience} ans d&apos;expérience{note ? ` · ★ ${note.toFixed(1)}` : ""}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {mentor.domaines.map((d) => <Badge key={d} ton="vert">{domaineNom(d)}</Badge>)}
          {mentor.competences.slice(0, 3).map((c) => <Badge key={c}>{c}</Badge>)}
        </div>
        {extra}
      </Carte>
    </Link>
  );
}

/** Message d'erreur sous un champ de formulaire. */
export function ErreurChamp({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400">{message}</p>;
}

export const champ =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-950";
export const bouton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50";
export const boutonSecondaire =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800";
