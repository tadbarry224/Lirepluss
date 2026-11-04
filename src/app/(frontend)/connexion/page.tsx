"use client";

import Link from "next/link";
import { useState } from "react";
import { CadreAuth } from "@/frontend/components/auth/CadreAuth";
import { ChampMotDePasse } from "@/frontend/components/auth/ChampMotDePasse";
import { ErreurChamp, bouton, champ } from "@/frontend/components/ui";
import { supabase, supabaseConfigure } from "@/frontend/lib/supabase";
import type { Role } from "@/shared/types";
import { messageErreurAuth, schemaConnexion, schemaInscription, schemaOubli, valider, type Erreurs } from "@/shared/validation/auth";

type Mode = "connexion" | "inscription" | "oubli";

export default function Connexion() {
  return <CadreAuth>{supabaseConfigure ? <Formulaires /> : <ModeDemo />}</CadreAuth>;
}

function ModeDemo() {
  return (
    <div className="flex h-full flex-col justify-center text-center">
      <p className="text-4xl">👋</p>
      <h2 className="mt-3 text-2xl font-bold">Bienvenue !</h2>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        L&apos;application fonctionne en <strong>mode démo</strong> : pas besoin de compte, vos données restent dans ce navigateur.
      </p>
      <Link href="/" className={`${bouton} mt-6`}>Entrer dans l&apos;application</Link>
      <p className="mt-6 text-xs text-slate-500">Pour activer les comptes et la messagerie en temps réel, configurez Supabase (voir le README).</p>
    </div>
  );
}

function Formulaires() {
  const [mode, setMode] = useState<Mode>("connexion");
  const [nom, setNom] = useState("");
  const [role, setRole] = useState<Role>("mentore");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [info, setInfo] = useState("");
  const [envoi, setEnvoi] = useState(false);

  function changerMode(m: Mode) {
    setMode(m);
    setErreurs({});
    setInfo("");
    setMotDePasse("");
    setConfirmation("");
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setInfo("");
    const sb = supabase();

    if (mode === "connexion") {
      const v = valider(schemaConnexion, { email, motDePasse });
      if (!v.ok) return setErreurs(v.erreurs);
      setErreurs({});
      setEnvoi(true);
      const { error } = await sb.auth.signInWithPassword({ email: v.donnees.email, password: v.donnees.motDePasse });
      setEnvoi(false);
      // En cas de succès, la redirection vers l'application est automatique.
      if (error) setErreurs({ formulaire: messageErreurAuth(error) });
      return;
    }

    if (mode === "inscription") {
      const v = valider(schemaInscription, { nom, role, email, motDePasse, confirmation });
      if (!v.ok) return setErreurs(v.erreurs);
      setErreurs({});
      setEnvoi(true);
      const { data, error } = await sb.auth.signUp({
        email: v.donnees.email,
        password: v.donnees.motDePasse,
        options: { data: { nom: v.donnees.nom, role: v.donnees.role }, emailRedirectTo: `${window.location.origin}/connexion` },
      });
      setEnvoi(false);
      if (error) return setErreurs({ formulaire: messageErreurAuth(error) });
      if (!data.session) {
        changerMode("connexion");
        setInfo(`Compte créé ! Ouvrez le lien envoyé à ${v.donnees.email} pour l'activer, puis connectez-vous.`);
      }
      // Avec une session, l'utilisateur est redirigé vers le questionnaire d'accueil.
      return;
    }

    const v = valider(schemaOubli, { email });
    if (!v.ok) return setErreurs(v.erreurs);
    setErreurs({});
    setEnvoi(true);
    const { error } = await sb.auth.resetPasswordForEmail(v.donnees.email, {
      redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
    });
    setEnvoi(false);
    // Même message que le compte existe ou non, pour ne pas révéler quelles adresses sont inscrites.
    if (error && error.status === 429) return setErreurs({ formulaire: messageErreurAuth(error) });
    setInfo(`Si un compte existe pour ${v.donnees.email}, vous allez recevoir un email avec un lien pour choisir un nouveau mot de passe.`);
  }

  const titres: Record<Mode, { titre: string; sousTitre: string; bouton: string }> = {
    connexion: { titre: "Connexion", sousTitre: "Heureux de vous revoir !", bouton: "Se connecter" },
    inscription: { titre: "Créer un compte", sousTitre: "Rejoignez la communauté en une minute.", bouton: "Créer mon compte" },
    oubli: { titre: "Mot de passe oublié", sousTitre: "Recevez un lien pour en choisir un nouveau.", bouton: "Envoyer le lien" },
  };

  return (
    <div>
      {mode !== "oubli" && (
        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
          {(["connexion", "inscription"] as const).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => changerMode(m)} className={`rounded-lg py-2 text-sm font-medium transition ${mode === m ? "bg-white shadow dark:bg-slate-900" : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"}`}>
              {m === "connexion" ? "Se connecter" : "Créer un compte"}
            </button>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold">{titres[mode].titre}</h2>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{titres[mode].sousTitre}</p>

      <form onSubmit={soumettre} noValidate className="space-y-4">
        {mode === "inscription" && (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Je souhaite…</legend>
              <div className="grid grid-cols-2 gap-2">
                {(["mentore", "mentor"] as const).map((r) => (
                  <button type="button" key={r} onClick={() => setRole(r)} aria-pressed={role === r} className={`rounded-xl border p-3 text-left text-sm transition ${role === r ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 hover:border-emerald-400 dark:border-slate-700"}`}>
                    <span className="text-xl" aria-hidden>{r === "mentore" ? "🌱" : "🧑‍🏫"}</span>
                    <span className="block font-semibold">{r === "mentore" ? "Être accompagné" : "Devenir mentor"}</span>
                    <span className="block text-xs text-slate-500">{r === "mentore" ? "Étudiant, jeune diplômé, porteur de projet…" : "Partager mon expérience"}</span>
                  </button>
                ))}
              </div>
              <ErreurChamp message={erreurs.role} />
            </fieldset>
            <label className="block text-sm font-medium">Nom complet
              <input value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="name" aria-invalid={Boolean(erreurs.nom)} className={`${champ} mt-1 font-normal`} />
              <ErreurChamp message={erreurs.nom} />
            </label>
          </>
        )}

        <label className="block text-sm font-medium">Adresse email
          <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="vous@exemple.com" aria-invalid={Boolean(erreurs.email)} className={`${champ} mt-1 font-normal`} />
          <ErreurChamp message={erreurs.email} />
        </label>

        {mode !== "oubli" && (
          <ChampMotDePasse
            label="Mot de passe"
            valeur={motDePasse}
            onChange={setMotDePasse}
            erreur={erreurs.motDePasse}
            autoComplete={mode === "connexion" ? "current-password" : "new-password"}
            indicateur={mode === "inscription"}
          />
        )}
        {mode === "inscription" && (
          <ChampMotDePasse label="Confirmez le mot de passe" valeur={confirmation} onChange={setConfirmation} erreur={erreurs.confirmation} autoComplete="new-password" />
        )}

        {mode === "connexion" && (
          <div className="text-right">
            <button type="button" onClick={() => changerMode("oubli")} className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
              Mot de passe oublié ?
            </button>
          </div>
        )}

        {erreurs.formulaire && (
          <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{erreurs.formulaire}</p>
        )}
        {info && (
          <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">{info}</p>
        )}

        <button disabled={envoi} className={`${bouton} w-full py-2.5`}>{envoi ? "Patientez…" : titres[mode].bouton}</button>

        {mode === "inscription" && (
          <p className="text-center text-xs text-slate-500">
            En créant un compte, vous vous engagez à échanger avec bienveillance et respect au sein de la communauté.
          </p>
        )}
        {mode === "oubli" && (
          <button type="button" onClick={() => changerMode("connexion")} className="block w-full text-center text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
            ← Retour à la connexion
          </button>
        )}
      </form>
    </div>
  );
}
