"use client";

import { createContext } from "react";
import type { Atelier, Mentor, Message, Objectif, Opportunite, Profil, Seance, Temoignage } from "@/shared/types";
import type { ErreursProfil } from "@/shared/validation/profil";

/**
 * Interface commune aux deux modes de stockage :
 *  - "demo"     : données locales dans le navigateur (aucune configuration nécessaire) ;
 *  - "supabase" : comptes utilisateurs et base de données partagée, temps réel.
 * Les pages n'utilisent que cette interface, via useStore().
 */
export interface Store {
  mode: "demo" | "supabase";
  pret: boolean;
  email: string | null;
  erreur: string | null;

  profil: Profil;
  seances: Seance[];
  messages: Message[];
  objectifs: Objectif[];
  opportunites: Opportunite[];
  favoris: string[];
  ateliers: Atelier[];
  /** Identifiants des ateliers auxquels je suis inscrit */
  mesAteliers: string[];
  temoignages: Temoignage[];

  /** Personnes proposées comme mentors dans la recherche */
  tousMentors: Mentor[];
  /** Toutes les personnes connues (mentors + mentorés avec qui on échange) */
  personnes: Mentor[];
  /** Identifiant de ma fiche mentor publique, null si je ne suis pas mentor */
  monIdMentor: string | null;

  /** Enregistre le profil via le backend, qui le valide. Les rôles mentor/mentoré sont pris en compte. */
  enregistrerProfil: (p: Profil) => Promise<ResultatEnregistrement>;
  /** Envoie une nouvelle photo de profil (déjà redimensionnée) au backend. */
  changerPhoto: (photo: Blob) => Promise<{ ok: true } | { ok: false; erreur: string }>;
  reserver: (s: Omit<Seance, "id" | "statut">) => void;
  majSeance: (id: string, champs: Partial<Seance>) => void;
  envoyerMessage: (interlocuteurId: string, texte: string, auteur?: Message["auteur"]) => void;
  ajouterObjectif: (o: Omit<Objectif, "id">) => void;
  basculerEtape: (objectifId: string, etapeId: string) => void;
  ajouterEtape: (objectifId: string, titre: string) => void;
  supprimerObjectif: (id: string) => void;
  publierOpportunite: (o: Omit<Opportunite, "id">) => void;
  basculerFavori: (id: string) => void;
  basculerInscriptionAtelier: (atelierId: string) => void;
  publierTemoignage: (t: Omit<Temoignage, "id" | "date" | "auteurNom" | "auteurNiveau">) => void;
  reinitialiser: () => void;
  deconnexion: () => void;
}

export type ResultatEnregistrement = { ok: true } | { ok: false; erreurs: ErreursProfil };

export const StoreContext = createContext<Store | null>(null);

export const uid = () => Math.random().toString(36).slice(2, 10);
