export type Role = "mentore" | "mentor";

export interface Domaine {
  id: string;
  nom: string;
  icone: string;
  description: string;
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
}

export interface Profil {
  nom: string;
  role: Role;
  ville: string;
  domaines: string[];
  competences: string[];
  besoins: string;
  niveau: "Étudiant" | "Jeune diplômé" | "Professionnel" | "Entrepreneur";
}

export type StatutSeance = "planifiee" | "terminee" | "annulee";

export interface Seance {
  id: string;
  mentorId: string;
  date: string; // ISO
  sujet: string;
  format: "Visio" | "Présentiel" | "Appel";
  statut: StatutSeance;
  note?: number;
  commentaire?: string;
}

export interface Message {
  id: string;
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
