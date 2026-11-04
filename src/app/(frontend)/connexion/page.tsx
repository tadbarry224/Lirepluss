"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_NAME, APP_TAGLINE, EVENEMENT } from "@/shared/data";
import { supabase, supabaseConfigure } from "@/frontend/lib/supabase";
import type { Role } from "@/shared/types";
import { Carte, bouton, champ } from "@/frontend/components/ui";

export default function Connexion() {
  const [onglet, setOnglet] = useState<"connexion" | "inscription">("connexion");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [role, setRole] = useState<Role>("mentore");
  const [message, setMessage] = useState<{ type: "erreur" | "info"; texte: string } | null>(null);
  const [chargement, setChargement] = useState(false);

  if (!supabaseConfigure) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="mb-4">L&apos;application tourne en <strong>mode démo</strong> : aucune connexion n&apos;est nécessaire.</p>
        <Link href="/" className={bouton}>Accéder à l&apos;application</Link>
      </div>
    );
  }

  async function valider(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setMessage(null);
    const sb = supabase();
    const { data, error } =
      onglet === "connexion"
        ? await sb.auth.signInWithPassword({ email, password: motDePasse })
        : await sb.auth.signUp({ email, password: motDePasse, options: { data: { nom, role } } });
    setChargement(false);
    if (error) {
      const traductions: Record<string, string> = {
        "Invalid login credentials": "Email ou mot de passe incorrect.",
        "User already registered": "Un compte existe déjà avec cet email : connectez-vous.",
        "Email not confirmed": "Confirmez votre email (lien reçu par mail) avant de vous connecter.",
      };
      setMessage({ type: "erreur", texte: traductions[error.message] ?? error.message });
      return;
    }
    if (onglet === "inscription" && !data.session) {
      setMessage({ type: "info", texte: "Compte créé ! Ouvrez le lien reçu par email pour l'activer, puis connectez-vous." });
    }
    // Avec une session, la redirection vers l'accueil est automatique.
  }

  return (
    <div className="mx-auto max-w-md py-6 sm:py-12">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white">L+</span>
        <h1 className="mt-3 text-2xl font-bold">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{APP_TAGLINE}</p>
        <p className="mt-1 text-xs text-slate-500">{EVENEMENT}</p>
      </div>

      <Carte>
        <div className="mb-5 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {(["connexion", "inscription"] as const).map((o) => (
            <button key={o} type="button" onClick={() => { setOnglet(o); setMessage(null); }} className={`rounded-lg py-1.5 text-sm font-medium ${onglet === o ? "bg-white shadow dark:bg-slate-900" : "text-slate-500"}`}>
              {o === "connexion" ? "Se connecter" : "Créer un compte"}
            </button>
          ))}
        </div>

        <form onSubmit={valider} className="space-y-3">
          {onglet === "inscription" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {(["mentore", "mentor"] as const).map((r) => (
                  <button type="button" key={r} onClick={() => setRole(r)} className={`rounded-xl border p-3 text-left text-sm ${role === r ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 dark:border-slate-700"}`}>
                    <span className="text-xl">{r === "mentore" ? "🌱" : "🧑‍🏫"}</span>
                    <span className="block font-semibold">{r === "mentore" ? "Je cherche un mentor" : "Je veux être mentor"}</span>
                  </button>
                ))}
              </div>
              <input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nom complet" autoComplete="name" className={champ} />
            </>
          )}
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Adresse email" autoComplete="email" className={champ} />
          <input required type="password" minLength={6} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="Mot de passe (6 caractères minimum)" autoComplete={onglet === "connexion" ? "current-password" : "new-password"} className={champ} />
          {message && (
            <p className={`rounded-xl p-3 text-sm ${message.type === "erreur" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"}`}>{message.texte}</p>
          )}
          <button disabled={chargement} className={`${bouton} w-full`}>
            {chargement ? "Patientez…" : onglet === "connexion" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>
      </Carte>
    </div>
  );
}
