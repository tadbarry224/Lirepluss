import Link from "next/link";
import { domaines, mentors, ressources } from "@/lib/data";
import { Badge, Carte, Titre } from "@/components/ui";

export default function Domaines() {
  return (
    <div>
      <Titre titre="Domaines d'intervention du mentorat" sousTitre="Le mentorat couvre la vie personnelle, académique et professionnelle. Choisissez un domaine pour trouver vos mentors." />
      <div className="grid gap-4 md:grid-cols-2">
        {domaines.map((d) => {
          const nbMentors = mentors.filter((m) => m.domaines.includes(d.id)).length;
          const nbRessources = ressources.filter((r) => r.domaine === d.id).length;
          return (
            <Carte key={d.id} className="flex h-full flex-col">
              <div className="flex items-start gap-3">
                <span className="text-4xl">{d.icone}</span>
                <div>
                  <h2 className="font-semibold">{d.nom}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{d.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {d.sousDomaines.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
              {d.avertissement && (
                <p className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">ℹ️ {d.avertissement}</p>
              )}
              <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                <span className="text-slate-500">{nbMentors} mentor{nbMentors > 1 ? "s" : ""} · {nbRessources} ressource{nbRessources > 1 ? "s" : ""}</span>
                <Link href={`/mentors?domaine=${d.id}`} className="font-medium text-emerald-600 hover:underline">Trouver un mentor →</Link>
              </div>
            </Carte>
          );
        })}
      </div>
    </div>
  );
}
