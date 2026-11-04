import type { Mentor, Profil } from "./types";
import { recommanderLocalement } from "./matching";

export interface ParcoursPropose {
  titre: string;
  etapes: string[];
  conseil: string;
  mentorId?: string;
}

/** Parcours types par domaine, utilisés quand l'IA n'est pas disponible. */
const modeles: Record<string, Omit<ParcoursPropose, "mentorId">> = {
  entrepreneuriat: {
    titre: "Passer de l'idée à mon premier client",
    etapes: ["Décrire mon idée et le problème qu'elle résout", "Interroger 10 clients potentiels", "Remplir un business model canvas", "Estimer mes coûts et mon prix de vente", "Préparer un pitch de 3 minutes", "Identifier 3 sources de financement"],
    conseil: "Commencez petit : un premier client payant vaut mieux qu'un business plan parfait.",
  },
  numerique: {
    titre: "Monter en compétences dans le numérique",
    etapes: ["Choisir une spécialité (développement, IA, cybersécurité, design…)", "Suivre une formation en ligne gratuite", "Réaliser 2 projets concrets", "Publier mes projets sur GitHub ou un portfolio", "Faire relire mon portfolio par mon mentor"],
    conseil: "Les recruteurs regardent vos projets avant vos diplômes : montrez ce que vous savez faire.",
  },
  orientation: {
    titre: "Décrocher mon premier emploi",
    etapes: ["Faire le bilan de mes compétences et de mes envies", "Rédiger un CV et une lettre de motivation", "Faire relire mon CV par mon mentor", "Préparer 10 réponses aux questions d'entretien", "Simuler un entretien avec mon mentor", "Postuler à 10 offres ciblées"],
    conseil: "Activez votre réseau : beaucoup d'offres ne sont jamais publiées.",
  },
  culture: {
    titre: "Mener à bien mon projet créatif",
    etapes: ["Définir mon projet (livre, film, contenu…) et mon public", "Produire une première version", "Faire lire ou visionner mon travail par mon mentor", "Retravailler à partir des retours", "Identifier un éditeur, un diffuseur ou une plateforme", "Présenter mon projet lors d'un événement culturel"],
    conseil: "Terminez une première version, même imparfaite : c'est sur elle que le mentor pourra vous aider.",
  },
  gestion: {
    titre: "Renforcer mes compétences en gestion",
    etapes: ["Identifier les compétences à développer (comptabilité, gestion de projet, RH…)", "Suivre un module de formation", "Appliquer sur un cas réel avec mon mentor", "Construire un tableau de bord de suivi", "Présenter un bilan à mon mentor"],
    conseil: "Pratiquez sur un cas réel : c'est en gérant qu'on apprend à gérer.",
  },
  leadership: {
    titre: "Gagner en confiance et en leadership",
    etapes: ["Identifier une situation qui me met mal à l'aise", "M'entraîner à une présentation de 2 minutes", "Prendre la parole lors d'une réunion ou d'un événement", "Organiser ma semaine avec une méthode de gestion du temps", "Faire un point de progrès avec mon mentor"],
    conseil: "La confiance se construit par petits pas : fixez-vous un défi par semaine.",
  },
  campus: {
    titre: "Préparer mon projet d'études en France",
    etapes: ["Définir mon projet d'études et mon projet professionnel", "Sélectionner des formations cohérentes avec mon parcours", "Rédiger mon CV et mes lettres de motivation", "Constituer mon dossier de candidature", "M'entraîner à l'entretien Campus France", "Me renseigner sur les démarches de mobilité"],
    conseil: "La cohérence entre votre parcours, la formation visée et votre projet professionnel est essentielle. Cet accompagnement ne garantit ni l'admission ni le visa.",
  },
};

export function parcoursLocal(profil: Profil, mentors: Mentor[]): ParcoursPropose {
  const domaine = profil.domaines.find((d) => modeles[d]) ?? "orientation";
  const mentorsDuDomaine = mentors.filter((m) => m.domaines.includes(domaine));
  const meilleur = recommanderLocalement(profil, mentorsDuDomaine.length ? mentorsDuDomaine : mentors)[0];
  return { ...modeles[domaine], mentorId: meilleur?.mentorId };
}
