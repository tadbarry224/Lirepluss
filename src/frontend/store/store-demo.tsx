"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ateliersInitiaux,
  mentors as mentorsDemo,
  messagesInitiaux,
  objectifsInitiaux,
  opportunitesInitiales,
  profilInitial,
  seancesInitiales,
  temoignagesInitiaux,
} from "@/shared/data";
import { appelApi } from "@/frontend/lib/api";
import type { ErreursProfil } from "@/shared/validation/profil";
import { StoreContext, uid, type Store } from "./store-core";
import type { Mentor, Message, Objectif, Opportunite, Profil, Seance, Temoignage } from "@/shared/types";

/** Mode démo : toutes les données restent dans le navigateur (localStorage). */

interface Etat {
  profil: Profil;
  seances: Seance[];
  messages: Message[];
  objectifs: Objectif[];
  opportunites: Opportunite[];
  favoris: string[];
  mentorsInscrits: Mentor[];
  mesAteliers: string[];
  temoignagesPublies: Temoignage[];
}

const etatInitial: Etat = {
  profil: profilInitial,
  seances: seancesInitiales,
  messages: messagesInitiaux,
  objectifs: objectifsInitiaux,
  opportunites: opportunitesInitiales,
  favoris: [],
  mentorsInscrits: [],
  mesAteliers: [],
  temoignagesPublies: [],
};

const CLE = "lireplus:etat:v2";
const ID_MOI = "moi";

/** Fiche publique de mentor tirée du profil : ajoutée si la personne est mentor, retirée sinon. */
function ficheMentor(p: Profil, inscrits: Mentor[]): Mentor[] {
  const autres = inscrits.filter((m) => m.id !== ID_MOI);
  if (p.role !== "mentor") return autres;
  return [
    ...autres,
    {
      id: ID_MOI,
      nom: p.nom,
      titre: p.titre || "Mentor",
      organisation: p.organisation || "Indépendant",
      ville: p.ville,
      domaines: p.domaines,
      competences: p.competences,
      bio: p.besoins,
      experience: p.experience ?? 1,
      langues: p.langues?.length ? p.langues : ["Français"],
      disponibilites: p.disponibilites ?? [],
      couleur: "bg-emerald-700",
      photo: p.photo,
      inscrit: true,
      role: "mentor",
    },
  ];
}

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [etat, setEtat] = useState<Etat>(etatInitial);
  const [pret, setPret] = useState(false);
  const charge = useRef(false);

  useEffect(() => {
    try {
      const brut = localStorage.getItem(CLE);
      // Lecture après le montage pour éviter une différence d'hydratation serveur/client.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (brut) setEtat({ ...etatInitial, ...JSON.parse(brut) });
    } catch {
      /* stockage indisponible : on garde les données de démo */
    }
    charge.current = true;
    setPret(true);
  }, []);

  useEffect(() => {
    if (!charge.current) return;
    try {
      localStorage.setItem(CLE, JSON.stringify(etat));
    } catch {
      /* ignore */
    }
  }, [etat]);

  const maj = useCallback((f: (e: Etat) => Partial<Etat>) => setEtat((e) => ({ ...e, ...f(e) })), []);
  const tousMentors = [...mentorsDemo, ...etat.mentorsInscrits];

  const store: Store = {
    ...etat,
    mode: "demo",
    pret,
    email: null,
    erreur: null,
    tousMentors,
    ateliers: ateliersInitiaux.map((a) => ({ ...a, inscrits: a.inscrits + (etat.mesAteliers.includes(a.id) ? 1 : 0) })),
    temoignages: [...etat.temoignagesPublies, ...temoignagesInitiaux],
    personnes: tousMentors,
    monIdMentor: etat.mentorsInscrits.some((m) => m.id === ID_MOI) ? ID_MOI : null,
    reserver: (s) => maj((e) => ({ seances: [...e.seances, { ...s, id: uid(), statut: "planifiee" }] })),
    majSeance: (id, champs) =>
      maj((e) => ({ seances: e.seances.map((s) => (s.id === id ? { ...s, ...champs } : s)) })),
    envoyerMessage: (mentorId, texte, auteur = "moi") =>
      maj((e) => ({
        messages: [...e.messages, { id: uid(), mentorId, auteur, texte, date: new Date().toISOString() }],
      })),
    ajouterObjectif: (o) => maj((e) => ({ objectifs: [...e.objectifs, { ...o, id: uid() }] })),
    basculerEtape: (oid, eid) =>
      maj((e) => ({
        objectifs: e.objectifs.map((o) =>
          o.id === oid ? { ...o, etapes: o.etapes.map((s) => (s.id === eid ? { ...s, fait: !s.fait } : s)) } : o,
        ),
      })),
    ajouterEtape: (oid, titre) =>
      maj((e) => ({
        objectifs: e.objectifs.map((o) =>
          o.id === oid ? { ...o, etapes: [...o.etapes, { id: uid(), titre, fait: false }] } : o,
        ),
      })),
    supprimerObjectif: (id) => maj((e) => ({ objectifs: e.objectifs.filter((o) => o.id !== id) })),
    publierOpportunite: (o) => maj((e) => ({ opportunites: [{ ...o, id: uid() }, ...e.opportunites] })),
    basculerFavori: (id) =>
      maj((e) => ({ favoris: e.favoris.includes(id) ? e.favoris.filter((f) => f !== id) : [...e.favoris, id] })),
    enregistrerProfil: async (p) => {
      // Même en mode démo, le profil est validé par le backend avant d'être conservé.
      const rep = await appelApi<{ profil?: Profil; erreurs?: ErreursProfil }>("/api/profil", {
        method: "PUT",
        body: JSON.stringify({ ...p, photo: etat.profil.photo }),
      });
      if (!rep.ok || !rep.donnees.profil) {
        return { ok: false, erreurs: rep.donnees.erreurs ?? { formulaire: "Serveur injoignable, réessayez." } };
      }
      const profil = rep.donnees.profil;
      maj((e) => ({ profil, mentorsInscrits: ficheMentor(profil, e.mentorsInscrits) }));
      return { ok: true };
    },
    changerPhoto: async (photo) => {
      const formulaire = new FormData();
      formulaire.append("photo", photo);
      const rep = await appelApi<{ photo?: string; erreur?: string }>("/api/profil/photo", { method: "POST", body: formulaire });
      if (!rep.ok || !rep.donnees.photo) return { ok: false, erreur: rep.donnees.erreur ?? "Serveur injoignable, réessayez." };
      const url = rep.donnees.photo;
      maj((e) => ({
        profil: { ...e.profil, photo: url },
        mentorsInscrits: e.mentorsInscrits.map((m) => (m.id === ID_MOI ? { ...m, photo: url } : m)),
      }));
      return { ok: true };
    },
    basculerInscriptionAtelier: (id) =>
      maj((e) => ({
        mesAteliers: e.mesAteliers.includes(id) ? e.mesAteliers.filter((x) => x !== id) : [...e.mesAteliers, id],
      })),
    publierTemoignage: (t) =>
      maj((e) => ({
        temoignagesPublies: [
          { ...t, id: uid(), date: new Date().toISOString(), auteurNom: e.profil.nom, auteurNiveau: e.profil.niveau },
          ...e.temoignagesPublies,
        ],
      })),
    reinitialiser: () => setEtat(etatInitial),
    deconnexion: () => {},
  };

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}
