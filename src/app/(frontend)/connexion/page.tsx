"use client";

import { useState } from "react";
import { CadreAuth } from "@/frontend/components/auth/CadreAuth";
import { ChampMotDePasse } from "@/frontend/components/auth/ChampMotDePasse";
import { ErreurChamp, bouton, boutonSecondaire, champ } from "@/frontend/components/ui";
import { connecterDemo, continuerEnInvite, inscrireDemo } from "@/frontend/lib/comptes-demo";
import { supabase, supabaseConfigure } from "@/frontend/lib/supabase";
import type { Role } from "@/shared/types";
import { messageErreurAuth, schemaConnexion, schemaInscription, schemaOubli, valider, type Erreurs } from "@/shared/validation/auth";

type Mode = "connexion" | "inscription" | "oubli";
type ErreurAuth = { code?: string; message: string; status?: number } | null;

/**
 * Ce que le formulaire sait faire, selon le mode :
 *  - Supabase : comptes partagés en ligne ;
 *  - démo : comptes gardés dans ce navigateur (aucun email envoyé, donc pas de « mot de passe oublié »).
 * En cas de succès, le store détecte la nouvelle session et redirige vers l'application.
 */
interface Authentification {
  connexion: (email: string, motDePasse: string) => Promise<ErreurAuth>;
  inscription: (d: { nom: string; role: Role; email: string; motDePasse: string }) => Promise<{ erreur: ErreurAuth; aConfirmer?: boolean }>;
  oubli: ((email: string) => Promise<ErreurAuth>) | null;
}

const authSupabase: Authentification = {
  connexion: async (email, motDePasse) => (await supabase().auth.signInWithPassword({ email, password: motDePasse })).error,
  inscription: async ({ nom, role, email, motDePasse }) => {
    const { data, error } = await supabase().auth.signUp({
      email,
      password: motDePasse,
      options: { data: { nom, role }, emailRedirectTo: `${window.location.origin}/connexion` },
    });
    // Sans session, Supabase attend que l'adresse soit confirmée par email.
    return { erreur: error, aConfirmer: !error && !data.session };
  },
  oubli: async (email) =>
    (await supabase().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe` })).error,
};

const authDemo: Authentification = {
  connexion: async (email, motDePasse) => (await connecterDemo(email, motDePasse)).erreur,
  inscription: async (d) => inscrireDemo(d),
  oubli: null,
};

export default function Connexion() {
  return (
    <CadreAuth>
      <Formulaires auth={supabaseConfigure ? authSupabase : authDemo} demo={!supabaseConfigure} />
    </CadreAuth>
  );
}

function Formulaires({ auth, demo }: { auth: Authentification; demo: boolean }) {
  const [mode, setMode] = useState<Mode>("connexion");
  const [nom, setNom] = useState("");
  const [role, setRole] = useState<Role>("mentore");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [info, setInfo] = useState("");
  const [envoi, setEnvoi] = useState(false);

  /** Modifie un champ et efface son erreur : le message disparaît dès que l'utilisateur corrige. */
  function saisir(cle: string, changer: (v: string) => void) {
    return (v: string) => {
      changer(v);
      setErreurs((e) => {
        if (!(cle in e) && !e.formulaire) return e;
        const reste = { ...e };
        delete reste[cle];
        delete reste.formulaire;
        return reste;
      });
    };
  }

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

    if (mode === "connexion") {
      const v = valider(schemaConnexion, { email, motDePasse });
      if (!v.ok) return setErreurs(v.erreurs);
      setErreurs({});
      setEnvoi(true);
      const erreur = await auth.connexion(v.donnees.email, v.donnees.motDePasse);
      setEnvoi(false);
      if (erreur) setErreurs({ formulaire: messageErreurAuth(erreur) });
      return;
    }

    if (mode === "inscription") {
      const v = valider(schemaInscription, { nom, role, email, motDePasse, confirmation });
      if (!v.ok) return setErreurs(v.erreurs);
      setErreurs({});
      setEnvoi(true);
      const { erreur, aConfirmer } = await auth.inscription(v.donnees);
      setEnvoi(false);
      if (erreur?.code === "user_already_exists" || erreur?.code === "email_exists") {
        // L'adresse est déjà inscrite : on propose directement de se connecter, email déjà rempli.
        changerMode("connexion");
        return setInfo(`Un compte existe déjà pour ${v.donnees.email} : saisissez votre mot de passe pour vous connecter.`);
      }
      if (erreur) return setErreurs({ formulaire: messageErreurAuth(erreur) });
      if (aConfirmer) {
        changerMode("connexion");
        setInfo(`Compte créé ! Ouvrez le lien envoyé à ${v.donnees.email} pour l'activer, puis connectez-vous.`);
      }
      // Sinon, la session est ouverte : redirection vers le questionnaire d'accueil.
      return;
    }

    if (!auth.oubli) return;
    const v = valider(schemaOubli, { email });
    if (!v.ok) return setErreurs(v.erreurs);
    setErreurs({});
    setEnvoi(true);
    const erreur = await auth.oubli(v.donnees.email);
    setEnvoi(false);
    // Même message que le compte existe ou non, pour ne pas révéler quelles adresses sont inscrites.
    if (erreur?.status === 429) return setErreurs({ formulaire: messageErreurAuth(erreur) });
    setInfo(`Si un compte existe pour ${v.donnees.email}, vous allez recevoir un email avec un lien pour choisir un nouveau mot de passe.`);
  }

  const titres: Record<Mode, { titre: string; sousTitre: string; bouton: string }> = {
    connexion: { titre: "Connexion", sousTitre: "Heureux de vous revoir !", bouton: "Se connecter" },
    inscription: { titre: "Créer un compte", sousTitre: "Rejoignez la communauté en une minute.", bouton: "Créer mon compte" },
    oubli: { titre: "Mot de passe oublié", sousTitre: "Recevez un lien pour en choisir un nouveau.", bouton: "Envoyer le lien" },
  };

  const retourConnexion = (
    <button type="button" onClick={() => changerMode("connexion")} className="block w-full text-center text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
      ← Retour à la connexion
    </button>
  );

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

      {mode === "oubli" && !auth.oubli ? (
        <div className="space-y-4">
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            En mode démo, les comptes sont gardés dans ce navigateur et aucun email ne peut être envoyé.
            Créez un nouveau compte, ou continuez en invité.
          </p>
          {retourConnexion}
        </div>
      ) : (
        <form onSubmit={soumettre} noValidate className="space-y-4">
          {mode === "inscription" && (
            <>
              <fieldset>
                <legend className="mb-2 text-sm font-medium">Je souhaite…</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["mentore", "mentor"] as const).map((r) => (
                    <button type="button" key={r} onClick={() => saisir("role", (v) => setRole(v as Role))(r)} aria-pressed={role === r} className={`rounded-xl border p-3 text-left text-sm transition ${role === r ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "border-slate-300 hover:border-emerald-400 dark:border-slate-700"}`}>
                      <span className="text-xl" aria-hidden>{r === "mentore" ? "🌱" : "🧑‍🏫"}</span>
                      <span className="block font-semibold">{r === "mentore" ? "Être accompagné" : "Devenir mentor"}</span>
                      <span className="block text-xs text-slate-500">{r === "mentore" ? "Étudiant, jeune diplômé, porteur de projet…" : "Partager mon expérience"}</span>
                    </button>
                  ))}
                </div>
                <ErreurChamp message={erreurs.role} />
              </fieldset>
              <label className="block text-sm font-medium">Nom complet
                <input value={nom} onChange={(e) => saisir("nom", setNom)(e.target.value)} autoComplete="name" aria-invalid={Boolean(erreurs.nom)} className={`${champ} mt-1 font-normal`} />
                <ErreurChamp message={erreurs.nom} />
              </label>
            </>
          )}

          <label className="block text-sm font-medium">Adresse email
            <input type="email" inputMode="email" value={email} onChange={(e) => saisir("email", setEmail)(e.target.value)} autoComplete="email" placeholder="vous@exemple.com" aria-invalid={Boolean(erreurs.email)} className={`${champ} mt-1 font-normal`} />
            <ErreurChamp message={erreurs.email} />
          </label>

          {mode !== "oubli" && (
            <ChampMotDePasse
              label="Mot de passe"
              valeur={motDePasse}
              onChange={saisir("motDePasse", setMotDePasse)}
              erreur={erreurs.motDePasse}
              autoComplete={mode === "connexion" ? "current-password" : "new-password"}
              indicateur={mode === "inscription"}
            />
          )}
          {mode === "inscription" && (
            <ChampMotDePasse label="Confirmez le mot de passe" valeur={confirmation} onChange={saisir("confirmation", setConfirmation)} erreur={erreurs.confirmation} autoComplete="new-password" />
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
          {mode === "oubli" && retourConnexion}
        </form>
      )}

      {demo && mode !== "oubli" && (
        <div className="mt-6 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
          <button type="button" onClick={continuerEnInvite} className={`${boutonSecondaire} w-full`}>
            Continuer en invité, sans compte
          </button>
          <p className="mt-3 text-xs text-slate-500">
            Mode démo : les comptes et les données restent dans ce navigateur.
            Configurez Supabase (voir le README) pour des comptes partagés en ligne.
          </p>
        </div>
      )}
    </div>
  );
}
