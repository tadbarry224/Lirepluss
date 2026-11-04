"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { APP_NAME } from "@/lib/data";
import { useStore } from "@/lib/store";

const liens = [
  { href: "/", label: "Tableau de bord", icone: "🏠" },
  { href: "/mentors", label: "Trouver un mentor", icone: "🔎" },
  { href: "/domaines", label: "Domaines", icone: "🗂️" },
  { href: "/seances", label: "Séances", icone: "📅" },
  { href: "/messages", label: "Messages", icone: "💬" },
  { href: "/objectifs", label: "Objectifs", icone: "🎯" },
  { href: "/ressources", label: "Ressources", icone: "📚" },
  { href: "/opportunites", label: "Opportunités", icone: "💼" },
  { href: "/profil", label: "Mon profil", icone: "👤" },
];

export function Navigation() {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const { profil } = useStore();

  const actif = (href: string) => (href === "/" ? chemin === "/" : chemin.startsWith(href));

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/90">
        <Link href="/" className="text-lg font-bold text-emerald-600">{APP_NAME}</Link>
        <button onClick={() => setOuvert(!ouvert)} className="rounded-lg p-2 text-xl" aria-label="Menu">{ouvert ? "✕" : "☰"}</button>
      </header>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white p-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 dark:border-slate-800 dark:bg-slate-950 ${ouvert ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Link href="/" onClick={() => setOuvert(false)} className="mb-8 hidden items-center gap-2 px-2 lg:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white">L+</span>
          <span className="text-xl font-bold">{APP_NAME}</span>
        </Link>
        <nav className="flex flex-col gap-1">
          {liens.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOuvert(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${actif(l.href) ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"}`}
            >
              <span aria-hidden>{l.icone}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-4 bottom-4 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-900">
          <p className="font-semibold">{profil.nom}</p>
          <p className="text-xs text-slate-500">{profil.role === "mentor" ? "Mentor" : "Mentoré"} · {profil.niveau}</p>
        </div>
      </aside>
      {ouvert && <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOuvert(false)} />}
    </>
  );
}
