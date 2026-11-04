import Link from "next/link";
import { domaines, mentors, ressources } from "@/lib/data";
import { Carte, Titre } from "@/components/ui";

export default function Domaines() {
  return (
    <div>
      <Titre titre="Catalogue des domaines d'expertise" sousTitre="Explorez les domaines et trouvez les mentors qui y excellent." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {domaines.map((d) => {
          const nbMentors = mentors.filter((m) => m.domaines.includes(d.id)).length;
          const nbRessources = ressources.filter((r) => r.domaine === d.id).length;
          return (
            <Link key={d.id} href={`/mentors?domaine=${d.id}`} className="transition hover:-translate-y-0.5">
              <Carte className="h-full hover:border-emerald-400">
                <p className="text-4xl">{d.icone}</p>
                <h2 className="mt-3 font-semibold">{d.nom}</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{d.description}</p>
                <p className="mt-4 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {nbMentors} mentor{nbMentors > 1 ? "s" : ""} · {nbRessources} ressource{nbRessources > 1 ? "s" : ""}
                </p>
              </Carte>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
