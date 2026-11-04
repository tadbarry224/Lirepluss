"use client";

import { useState } from "react";
import { useStore, formatDate } from "@/frontend/store";
import type { DemandeMentorat as Demande, Mentor } from "@/shared/types";
import { validerDemande, type ErreursDemande } from "@/shared/validation/demande";
import { ErreurChamp, bouton, champ } from "./ui";

/**
 * Étape 3 du programme : le mentoré demande à être accompagné, le mentor répond.
 * Affiche le formulaire de demande, ou l'état de la demande en cours.
 */
export function DemandeMentorat({ mentor, relation }: { mentor: Mentor; relation?: Demande }) {
  const { envoyerDemande } = useStore();
  const [objectif, setObjectif] = useState("");
  const [message, setMessage] = useState("");
  const [erreurs, setErreurs] = useState<ErreursDemande>({});
  const [envoi, setEnvoi] = useState(false);
  const prenom = mentor.nom.replace(/^Dr\s+/, "").split(" ")[0];

  if (relation?.statut === "en_attente") {
    return (
      <div className="space-y-2 text-center">
        <p className="text-4xl">⏳</p>
        <p className="font-medium">Demande envoyée le {formatDate(relation.date)}</p>
        <p className="text-sm text-slate-500">{prenom} doit l&apos;accepter avant que vous puissiez réserver une séance. Vous serez notifié ici.</p>
        <p className="rounded-xl bg-slate-50 p-3 text-left text-sm italic dark:bg-slate-800/50">« {relation.message} »</p>
      </div>
    );
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    const donnees = { mentorId: mentor.id, objectif, message };
    const local = validerDemande(donnees);
    if (!local.ok) return setErreurs(local.erreurs);
    setEnvoi(true);
    const r = await envoyerDemande(local.demande);
    setEnvoi(false);
    setErreurs(r.ok ? {} : r.erreurs);
  }

  return (
    <form onSubmit={envoyer} noValidate className="space-y-3">
      {relation?.statut === "refusee" && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          Votre précédente demande n&apos;a pas pu être acceptée{relation.reponse ? ` : « ${relation.reponse} »` : "."} Vous pouvez en envoyer une nouvelle ou choisir un autre mentor.
        </p>
      )}
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Le mentorat repose sur une relation de confiance : présentez-vous à {prenom}. Une fois votre demande acceptée, vous pourrez réserver vos séances.
      </p>
      <label className="block text-sm font-medium">Votre objectif
        <input value={objectif} onChange={(e) => setObjectif(e.target.value)} maxLength={150} placeholder="Ex : préparer mon entretien Campus France" className={`${champ} mt-1 font-normal`} />
        <ErreurChamp message={erreurs.objectif} />
      </label>
      <label className="block text-sm font-medium">Votre message
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={1000} placeholder={`Bonjour ${prenom}, je suis… et j'aimerais votre accompagnement pour…`} className={`${champ} mt-1 font-normal`} />
        <span className="block text-right text-xs text-slate-400">{message.trim().length} / 1000</span>
        <ErreurChamp message={erreurs.message} />
      </label>
      <ErreurChamp message={erreurs.formulaire ?? erreurs.mentorId} />
      <button disabled={envoi} className={`${bouton} w-full`}>{envoi ? "Envoi…" : "Envoyer ma demande de mentorat"}</button>
    </form>
  );
}
