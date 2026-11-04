"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { APP_TAGLINE, EVENEMENT } from "@/shared/data";
import { recommanderLocalement } from "@/shared/matching";
import { formatDate, progression, useStore } from "@/frontend/store";
import { Avatar, Barre, Carte, CarteMentor, bouton, boutonSecondaire } from "@/frontend/components/ui";

export default function TableauDeBord() {
  const { profil, seances, objectifs, opportunites, messages, tousMentors: mentors, personnes, mode, ateliers, mesAteliers } = useStore();
  const router = useRouter();
  const aVenir = seances
    .filter((s) => s.statut === "planifiee" && new Date(s.date) >= new Date())
    .sort((a, b) => a.date.localeCompare(b.date));
  const terminees = seances.filter((s) => s.statut === "terminee");
  const aEvaluer = terminees.filter((s) => !s.note && !s.jeSuisLeMentor);
  const top = recommanderLocalement(profil, mentors, seances).slice(0, 3);
  const progMoy = objectifs.length ? Math.round(objectifs.reduce((a, o) => a + progression(o), 0) / objectifs.length) : 0;

  const besoinsAIdentifier = profil.domaines.length === 0 || (profil.role === "mentore" && !profil.attentes?.length);

  // Nouveau compte (mode Supabase) : on commence par l'étape 1, l'identification des besoins.
  useEffect(() => {
    if (mode === "supabase" && profil.domaines.length === 0) router.replace("/bienvenue");
  }, [mode, profil.domaines.length, router]);

  const stats = [
    { label: "Séances à venir", valeur: aVenir.length, href: "/seances" },
    { label: "Séances réalisées", valeur: terminees.length, href: "/seances" },
    { label: "Progression des objectifs", valeur: `${progMoy}%`, href: "/objectifs" },
    { label: "Conversations", valeur: new Set(messages.map((m) => m.mentorId)).size, href: "/messages" },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white sm:p-10">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">{EVENEMENT}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Bonjour {profil.nom} 👋</h1>
        <p className="mt-3 max-w-2xl text-emerald-50">Le mentorat à l&apos;ère du numérique : {APP_TAGLINE.charAt(0).toLowerCase() + APP_TAGLINE.slice(1)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/mentors" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">Trouver mon mentor</Link>
          <Link href="/objectifs" className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white/10">✨ Créer mon parcours avec l&apos;IA</Link>
          <Link href="/profil" className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white/10">{profil.role === "mentor" ? "Mon profil de mentor" : "Devenir mentor"}</Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Carte className="hover:border-emerald-400">
              <p className="text-3xl font-bold">{s.valeur}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{s.label}</p>
            </Carte>
          </Link>
        ))}
      </section>

      {besoinsAIdentifier && (
        <Carte className="flex flex-wrap items-center justify-between gap-3 border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30">
          <div>
            <p className="font-semibold">Étape 1 : identifiez vos besoins</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">4 questions pour vous proposer les mentors et ateliers les plus adaptés.</p>
          </div>
          <Link href="/bienvenue" className={bouton}>Commencer</Link>
        </Carte>
      )}

      {ateliers.some((a) => !mesAteliers.includes(a.id) && new Date(a.date) >= new Date() && a.inscrits < a.places) && (
        <Carte className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">
            👥 <strong>{ateliers.filter((a) => new Date(a.date) >= new Date()).length} ateliers thématiques</strong> à venir, animés par les mentors.
          </p>
          <Link href="/ateliers" className={boutonSecondaire}>Voir les ateliers</Link>
        </Carte>
      )}

      {aEvaluer.length > 0 && (
        <Carte className="flex flex-wrap items-center justify-between gap-3 border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm">⭐ Vous avez <strong>{aEvaluer.length}</strong> séance(s) à évaluer. Votre avis aide la communauté.</p>
          <Link href="/seances" className={bouton}>Évaluer</Link>
        </Carte>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mentors recommandés pour vous</h2>
            <Link href="/mentors" className="text-sm font-medium text-emerald-600 hover:underline">Voir tout →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-1">
            {top.map((r) => {
              const m = mentors.find((x) => x.id === r.mentorId)!;
              return (
                <CarteMentor
                  key={m.id}
                  mentor={m}
                  extra={<p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">✨ {r.score}% compatible — {r.raison}</p>}
                />
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Prochaines séances</h2>
            <Carte className="space-y-4">
              {aVenir.length === 0 && <p className="text-sm text-slate-500">Aucune séance planifiée.</p>}
              {aVenir.slice(0, 3).map((s) => {
                const m = personnes.find((x) => x.id === s.mentorId);
                if (!m) return null;
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <Avatar mentor={m} taille="sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.sujet}</p>
                      <p className="text-xs text-slate-500">{m.nom} · {formatDate(s.date, true)}</p>
                    </div>
                  </div>
                );
              })}
              <Link href="/seances" className={`${boutonSecondaire} w-full`}>Gérer mes séances</Link>
            </Carte>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Mes objectifs</h2>
            <Carte className="space-y-4">
              {objectifs.slice(0, 3).map((o) => (
                <div key={o.id}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="truncate font-medium">{o.titre}</span>
                    <span className="text-slate-500">{progression(o)}%</span>
                  </div>
                  <Barre valeur={progression(o)} />
                </div>
              ))}
              {objectifs.length === 0 && <p className="text-sm text-slate-500">Aucun objectif.</p>}
            </Carte>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Dernières opportunités</h2>
            <Carte className="space-y-3">
              {opportunites.slice(0, 3).map((o) => (
                <div key={o.id} className="text-sm">
                  <p className="font-medium">{o.titre}</p>
                  <p className="text-xs text-slate-500">{o.organisation} · avant le {formatDate(o.dateLimite)}</p>
                </div>
              ))}
              <Link href="/opportunites" className="text-sm font-medium text-emerald-600 hover:underline">Toutes les opportunités →</Link>
            </Carte>
          </section>
        </div>
      </div>
    </div>
  );
}
