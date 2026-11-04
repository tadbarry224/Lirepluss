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
} from "./data";
import { StoreContext, uid, type Store } from "./store-core";
import type { Mentor, Message, Objectif, Opportunite, Profil, Seance, Temoignage } from "./types";

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
    majProfil: (profil) => maj(() => ({ profil })),
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
    publierProfilMentor: (p) =>
      maj((e) => ({
        profil: p,
        mentorsInscrits: [
          ...e.mentorsInscrits.filter((m) => m.id !== ID_MOI),
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
            disponibilites: p.disponibilites?.length ? p.disponibilites : ["Sam 10:00"],
            couleur: "bg-emerald-700",
            inscrit: true,
            role: "mentor",
          },
        ],
      })),
    retirerProfilMentor: () => maj((e) => ({ mentorsInscrits: e.mentorsInscrits.filter((m) => m.id !== ID_MOI) })),
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
