"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CadreAuth } from "@/frontend/components/auth/CadreAuth";
import { ChampMotDePasse } from "@/frontend/components/auth/ChampMotDePasse";
import { bouton } from "@/frontend/components/ui";
import { supabase, supabaseConfigure } from "@/frontend/lib/supabase";
import { messageErreurAuth, schemaNouveauMotDePasse, valider, type Erreurs } from "@/shared/validation/auth";

/**
 * Page ouverte depuis le lien reçu par email (« Mot de passe oublié »).
 * Supabase ouvre une session temporaire à partir du lien ; l'utilisateur choisit alors un nouveau mot de passe.
 */
export default function ReinitialiserMotDePasse() {
  const [lienValide, setLienValide] = useState<boolean | null>(null);
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [envoi, setEnvoi] = useState(false);
  const [termine, setTermine] = useState(false);

  useEffect(() => {
    if (!supabaseConfigure) return;
    const sb = supabase();
    const { data } = sb.auth.onAuthStateChange((evenement, session) => {
      if (evenement === "PASSWORD_RECOVERY" || session) setLienValide(true);
    });
    // Laisse le temps à Supabase de lire le jeton présent dans l'adresse du lien
    const delai = setTimeout(async () => {
      const { data: s } = await sb.auth.getSession();
      setLienValide((v) => v ?? Boolean(s.session));
    }, 1500);
    return () => {
      data.subscription.unsubscribe();
      clearTimeout(delai);
    };
  }, []);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    const v = valider(schemaNouveauMotDePasse, { motDePasse, confirmation });
    if (!v.ok) return setErreurs(v.erreurs);
    setErreurs({});
    setEnvoi(true);
    const { error } = await supabase().auth.updateUser({ password: v.donnees.motDePasse });
    setEnvoi(false);
    if (error) return setErreurs({ formulaire: messageErreurAuth(error) });
    setTermine(true);
  }

  if (!supabaseConfigure) {
    return (
      <CadreAuth>
        <p className="text-slate-600 dark:text-slate-400">Cette page n&apos;est utile qu&apos;avec les comptes utilisateurs (mode Supabase).</p>
        <Link href="/" className={`${bouton} mt-4`}>Retour à l&apos;application</Link>
      </CadreAuth>
    );
  }

  return (
    <CadreAuth>
      <h2 className="text-2xl font-bold">Nouveau mot de passe</h2>

      {termine ? (
        <div className="mt-6 space-y-4">
          <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            ✓ Votre mot de passe a été modifié. Vous êtes connecté.
          </p>
          <Link href="/" className={`${bouton} w-full`}>Accéder à l&apos;application</Link>
        </div>
      ) : lienValide === null ? (
        <p className="mt-6 text-sm text-slate-500">Vérification du lien…</p>
      ) : !lienValide ? (
        <div className="mt-6 space-y-4">
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            Ce lien est invalide ou a expiré. Demandez un nouveau lien depuis la page de connexion.
          </p>
          <Link href="/connexion" className={`${bouton} w-full`}>Retour à la connexion</Link>
        </div>
      ) : (
        <form onSubmit={enregistrer} noValidate className="mt-6 space-y-4">
          <ChampMotDePasse label="Nouveau mot de passe" valeur={motDePasse} onChange={setMotDePasse} erreur={erreurs.motDePasse} autoComplete="new-password" indicateur />
          <ChampMotDePasse label="Confirmez le mot de passe" valeur={confirmation} onChange={setConfirmation} erreur={erreurs.confirmation} autoComplete="new-password" />
          {erreurs.formulaire && (
            <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{erreurs.formulaire}</p>
          )}
          <button disabled={envoi} className={`${bouton} w-full py-2.5`}>{envoi ? "Enregistrement…" : "Enregistrer le mot de passe"}</button>
        </form>
      )}
    </CadreAuth>
  );
}
