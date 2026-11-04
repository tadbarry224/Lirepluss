export type Role = "mentore" | "mentor";

export interface Domaine {
  id: string;
  nom: string;
  icone: string;
  description: string;
  sousDomaines: string[];
  avertissement?: string;
}

export interface Mentor {
  id: string;
  nom: string;
  titre: string;
  organisation: string;
  ville: string;
  domaines: string[];
  competences: string[];
  bio: string;
  experience: number;
  langues: string[];
  disponibilites: string[];
  couleur: string;
  /** true pour un mentor inscrit via la plateforme (et non une donnée de démo) */
  inscrit?: boolean;
  /** Rôle de la personne (les mentorés apparaissent aussi, côté mentor, dans les séances et messages) */
  role?: Role;
  /** URL de la photo de profil (ou image encodée en mode démo) */
  photo?: string;
}

export const profilsBeneficiaires = [
  "Étudiant",
  "Jeune diplômé",
  "Entrepreneur",
  "Porteur de projet",
  "Professionnel en reconversion",
  "Développement de compétences",
  "Professionnel expérimenté",
] as const;

export type Niveau = (typeof profilsBeneficiaires)[number];

export interface Profil {
  nom: string;
  role: Role;
  ville: string;
  domaines: string[];
  competences: string[];
  besoins: string;
  niveau: Niveau;
  /** Attentes vis-à-vis du mentorat (axes du programme, TDR §6) */
  attentes?: string[];
  formatPrefere?: Seance["format"];
  photo?: string;
  /** Le mentor a accepté la charte d'engagement (TDR §9) */
  charteAcceptee?: boolean;
  // Champs spécifiques aux mentors
  titre?: string;
  organisation?: string;
  experience?: number;
  langues?: string[];
  disponibilites?: string[];
}

export type StatutSeance = "planifiee" | "terminee" | "annulee";

export interface Seance {
  id: string;
  /** L'autre participant de la séance (le mentor pour un mentoré, le mentoré pour un mentor) */
  mentorId: string;
  /** true si l'utilisateur connecté est le mentor de cette séance */
  jeSuisLeMentor?: boolean;
  date: string; // ISO
  sujet: string;
  format: "Visio" | "Chat" | "Présentiel";
  statut: StatutSeance;
  note?: number;
  commentaire?: string;
}

export interface Message {
  id: string;
  /** L'interlocuteur de la conversation */
  mentorId: string;
  auteur: "moi" | "mentor";
  texte: string;
  date: string;
}

export interface Etape {
  id: string;
  titre: string;
  fait: boolean;
}

export interface Objectif {
  id: string;
  titre: string;
  echeance: string;
  mentorId?: string;
  etapes: Etape[];
}

export interface Ressource {
  id: string;
  titre: string;
  type: "Article" | "Vidéo" | "Guide" | "Podcast" | "Modèle";
  domaine: string;
  auteur: string;
  resume: string;
  duree: string;
}

export interface Opportunite {
  id: string;
  titre: string;
  type: "Stage" | "Emploi" | "Bourse" | "Concours" | "Financement" | "Formation";
  organisation: string;
  lieu: string;
  dateLimite: string;
  domaine: string;
  description: string;
  publiePar: string;
}

export interface Recommandation {
  mentorId: string;
  score: number;
  raison: string;
}

/** Atelier thématique collectif (TDR §10, étape 4) */
export interface Atelier {
  id: string;
  titre: string;
  domaine: string;
  animateurId: string;
  date: string; // ISO
  dureeMinutes: number;
  format: "Visio" | "Présentiel";
  lieu: string;
  places: number;
  inscrits: number;
  description: string;
}

/** Témoignage publié après une séance (TDR §10, étape 7 : restitution des expériences) */
export interface Temoignage {
  id: string;
  auteurNom: string;
  auteurNiveau: string;
  mentorId: string;
  texte: string;
  note: number;
  date: string;
}
