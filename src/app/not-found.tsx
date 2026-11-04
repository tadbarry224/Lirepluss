import Link from "next/link";
import { bouton, boutonSecondaire } from "@/frontend/components/ui";

/** Page affichée pour une adresse inconnue (remplace la page anglaise par défaut de Next.js). */
export default function PageIntrouvable() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <p className="text-5xl" aria-hidden>🧭</p>
      <h1 className="mt-4 text-2xl font-bold">Page introuvable</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">Cette adresse n&apos;existe pas ou a changé.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={bouton}>Tableau de bord</Link>
        <Link href="/mentors" className={boutonSecondaire}>Trouver un mentor</Link>
      </div>
    </div>
  );
}
