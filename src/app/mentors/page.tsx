"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { domaines } from "@/lib/data";
import { noteMoyenne, recommanderLocalement } from "@/lib/matching";
import { useStore } from "@/lib/store";
import type { Recommandation } from "@/lib/types";
import { Carte, CarteMentor, Titre, bouton, champ } from "@/components/ui";

function RechercheMentors() {
  const params = useSearchParams();
  const { profil, seances, tousMentors: mentors } = useStore();
  const [texte, setTexte] = useState("");
  const [domaine, setDomaine] = useState(params.get("domaine") ?? "");
  const [ville, setVille] = useState("");
  const [besoin, setBesoin] = useState(profil.besoins);
  const [recos, setRecos] = useState<Recommandation[] | null>(null);
  const [source, setSource] = useState<"ia" | "local" | null>(null);
  const [chargement, setChargement] = useState(false);

  const villes = [...new Set(mentors.map((m) => m.ville))];

  const resultats = useMemo(() => {
    const q = texte.toLowerCase();
    return mentors.filter(
      (m) =>
        (!domaine || m.domaines.includes(domaine)) &&
        (!ville || m.ville === ville) &&
        (!q || [m.nom, m.titre, m.organisation, ...m.competences].join(" ").toLowerCase().includes(q)),
    );
  }, [texte, domaine, ville, mentors]);

  async function recommander() {
    setChargement(true);
    const profilRequete = { ...profil, besoins: besoin };
    try {
      const rep = await fetch("/api/recommandation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profil: profilRequete }),
      });
      if (!rep.ok) throw new Error();
      const data = (await rep.json()) as { recommandations: Recommandation[] };
      setRecos(data.recommandations);
      setSource("ia");
    } catch {
      setRecos(recommanderLocalement(profilRequete, mentors, seances).slice(0, 3));
      setSource("local");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div>
      <Titre titre="Trouver un mentor" sousTitre={`${mentors.length} mentors disponibles dans ${domaines.length} domaines d'expertise`} />

      <Carte className="mb-8 border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
        <h2 className="font-semibold">✨ Recommandation intelligente</h2>
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">Décrivez votre besoin, l&apos;IA vous propose les mentors les plus adaptés et vous explique pourquoi.</p>
        <textarea value={besoin} onChange={(e) => setBesoin(e.target.value)} rows={3} className={champ} placeholder="Ex : je veux créer une entreprise de transformation agricole et trouver un financement…" />
        <button onClick={recommander} disabled={chargement || !besoin.trim()} className={`${bouton} mt-3`}>
          {chargement ? "Analyse en cours…" : "Me recommander des mentors"}
        </button>
        {recos && (
          <div className="mt-5">
            <p className="mb-3 text-xs text-slate-500">{source === "ia" ? "Recommandations générées par Claude (IA)" : "Recommandations calculées localement (IA indisponible)"}</p>
            <div className="grid gap-4 md:grid-cols-3">
              {recos.map((r, i) => {
                const m = mentors.find((x) => x.id === r.mentorId);
                if (!m) return null;
                return (
                  <CarteMentor
                    key={m.id}
                    mentor={m}
                    extra={<p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400"><strong>#{i + 1} · {r.score}%</strong> — {r.raison}</p>}
                  />
                );
              })}
            </div>
          </div>
        )}
      </Carte>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <input value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Nom, compétence, organisation…" className={champ} />
        <select value={domaine} onChange={(e) => setDomaine(e.target.value)} className={champ}>
          <option value="">Tous les domaines</option>
          {domaines.map((d) => <option key={d.id} value={d.id}>{d.icone} {d.nom}</option>)}
        </select>
        <select value={ville} onChange={(e) => setVille(e.target.value)} className={champ}>
          <option value="">Toutes les villes</option>
          {villes.map((v) => <option key={v}>{v}</option>)}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {resultats.map((m) => <CarteMentor key={m.id} mentor={m} note={noteMoyenne(m.id, seances)} />)}
      </div>
      {resultats.length === 0 && <p className="py-10 text-center text-slate-500">Aucun mentor ne correspond à ces critères.</p>}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <RechercheMentors />
    </Suspense>
  );
}
