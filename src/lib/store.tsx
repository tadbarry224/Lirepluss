"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  messagesInitiaux,
  objectifsInitiaux,
  opportunitesInitiales,
  profilInitial,
  seancesInitiales,
} from "./data";
import type { Message, Objectif, Opportunite, Profil, Seance } from "./types";

interface Etat {
  profil: Profil;
  seances: Seance[];
  messages: Message[];
  objectifs: Objectif[];
  opportunites: Opportunite[];
  favoris: string[];
}

const etatInitial: Etat = {
  profil: profilInitial,
  seances: seancesInitiales,
  messages: messagesInitiaux,
  objectifs: objectifsInitiaux,
  opportunites: opportunitesInitiales,
  favoris: [],
};

const CLE = "lireplus:etat:v1";

interface Store extends Etat {
  pret: boolean;
  majProfil: (p: Profil) => void;
  reserver: (s: Omit<Seance, "id" | "statut">) => void;
  majSeance: (id: string, champs: Partial<Seance>) => void;
  envoyerMessage: (mentorId: string, texte: string, auteur?: Message["auteur"]) => void;
  ajouterObjectif: (o: Omit<Objectif, "id">) => void;
  basculerEtape: (objectifId: string, etapeId: string) => void;
  ajouterEtape: (objectifId: string, titre: string) => void;
  supprimerObjectif: (id: string) => void;
  publierOpportunite: (o: Omit<Opportunite, "id">) => void;
  basculerFavori: (id: string) => void;
  reinitialiser: () => void;
}

const Ctx = createContext<Store | null>(null);

export const uid = () => Math.random().toString(36).slice(2, 10);

export function StoreProvider({ children }: { children: React.ReactNode }) {
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

  const store: Store = {
    ...etat,
    pret,
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
    reinitialiser: () => setEtat(etatInitial),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore doit être utilisé dans <StoreProvider>");
  return s;
}

export function progression(o: Objectif) {
  if (o.etapes.length === 0) return 0;
  return Math.round((o.etapes.filter((e) => e.fait).length / o.etapes.length) * 100);
}

export function formatDate(iso: string, avecHeure = false) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    weekday: avecHeure ? "short" : undefined,
    day: "numeric",
    month: "short",
    year: avecHeure ? undefined : "numeric",
    hour: avecHeure ? "2-digit" : undefined,
    minute: avecHeure ? "2-digit" : undefined,
  });
}
