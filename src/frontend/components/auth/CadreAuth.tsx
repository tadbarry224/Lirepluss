import { APP_NAME, APP_TAGLINE, EVENEMENT, domaines } from "@/shared/data";

const atouts = [
  { icone: "🔎", titre: "Le bon mentor pour vous", texte: `Des professionnels dans ${domaines.length} domaines, recommandés selon vos besoins.` },
  { icone: "🎥", titre: "Échangez où que vous soyez", texte: "Séances en visio, par messages ou en présentiel." },
  { icone: "🎯", titre: "Avancez pas à pas", texte: "Objectifs, plan d'action et parcours personnalisé par l'IA." },
];

/** Mise en page des pages d'authentification : présentation à gauche, formulaire à droite. */
export function CadreAuth({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
      <aside className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white sm:p-10">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold">L+</span>
          <span className="text-2xl font-bold">{APP_NAME}</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold leading-tight sm:text-3xl">Le mentorat à l&apos;ère du numérique</h1>
        <p className="mt-2 text-emerald-50">{APP_TAGLINE}</p>
        <ul className="mt-8 hidden space-y-5 sm:block">
          {atouts.map((a) => (
            <li key={a.titre} className="flex gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl" aria-hidden>{a.icone}</span>
              <span>
                <span className="block font-semibold">{a.titre}</span>
                <span className="block text-sm text-emerald-50">{a.texte}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-emerald-100">{EVENEMENT}</p>
      </aside>
      <div className="p-6 sm:p-10">{children}</div>
    </div>
  );
}
