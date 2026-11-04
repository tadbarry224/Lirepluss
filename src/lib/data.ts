import type {
  Domaine,
  Mentor,
  Message,
  Objectif,
  Opportunite,
  Profil,
  Ressource,
  Seance,
} from "./types";

export const APP_NAME = "LirePlus";
export const APP_TAGLINE = "Connecter les talents, transmettre les expériences, construire les carrières de demain.";

export const domaines: Domaine[] = [
  { id: "dev", nom: "Développement logiciel", icone: "💻", description: "Web, mobile, architecture, bonnes pratiques de code." },
  { id: "data", nom: "Data & IA", icone: "🤖", description: "Analyse de données, machine learning, IA générative." },
  { id: "entrepreneuriat", nom: "Entrepreneuriat", icone: "🚀", description: "Création d'entreprise, business model, levée de fonds." },
  { id: "finance", nom: "Finance & Comptabilité", icone: "📊", description: "Gestion financière, comptabilité, microfinance." },
  { id: "agri", nom: "Agronomie & Agro-business", icone: "🌱", description: "Agriculture moderne, transformation, chaînes de valeur." },
  { id: "sante", nom: "Santé", icone: "🩺", description: "Médecine, santé publique, pharmacie." },
  { id: "marketing", nom: "Marketing & Communication", icone: "📣", description: "Marketing digital, marque, réseaux sociaux." },
  { id: "droit", nom: "Droit & Administration", icone: "⚖️", description: "Droit des affaires, administration publique." },
  { id: "education", nom: "Éducation & Recherche", icone: "🎓", description: "Enseignement, recherche, publication scientifique." },
  { id: "leadership", nom: "Leadership & Soft skills", icone: "🧭", description: "Prise de parole, gestion d'équipe, orientation de carrière." },
];

export const mentors: Mentor[] = [
  {
    id: "m1", nom: "Mariama Diallo", titre: "Ingénieure logicielle senior", organisation: "Orange Digital Center", ville: "Conakry",
    domaines: ["dev", "leadership"], competences: ["React", "Node.js", "Architecture", "Recrutement tech"],
    bio: "10 ans d'expérience dans le développement web. J'accompagne les jeunes développeurs dans leur premier emploi et leurs projets open source.",
    experience: 10, langues: ["Français", "Pular", "Anglais"], disponibilites: ["Lun 18:00", "Mer 18:00", "Sam 10:00"], couleur: "bg-emerald-600",
  },
  {
    id: "m2", nom: "Ibrahima Sow", titre: "Data scientist", organisation: "Banque Centrale (BCRG)", ville: "Conakry",
    domaines: ["data", "finance"], competences: ["Python", "Machine learning", "SQL", "Statistiques"],
    bio: "Je travaille sur des modèles de prévision économique. Passionné par la vulgarisation de l'IA pour les étudiants guinéens.",
    experience: 7, langues: ["Français", "Anglais"], disponibilites: ["Mar 19:00", "Jeu 19:00"], couleur: "bg-sky-600",
  },
  {
    id: "m3", nom: "Fatoumata Camara", titre: "Fondatrice & CEO", organisation: "AgriTech Guinée", ville: "Labé",
    domaines: ["entrepreneuriat", "agri"], competences: ["Business plan", "Levée de fonds", "Agro-transformation", "Pitch"],
    bio: "J'ai créé une startup de transformation de fonio au Fouta. J'aide les porteurs de projet à passer de l'idée au premier client.",
    experience: 8, langues: ["Français", "Pular"], disponibilites: ["Ven 17:00", "Sam 09:00"], couleur: "bg-amber-600",
  },
  {
    id: "m4", nom: "Dr Alpha Oumar Bah", titre: "Enseignant-chercheur", organisation: "Université de Labé", ville: "Labé",
    domaines: ["education", "data"], competences: ["Méthodologie de recherche", "Rédaction scientifique", "R", "Bourses d'études"],
    bio: "Docteur en statistiques appliquées. J'oriente les étudiants vers les masters et bourses à l'international.",
    experience: 15, langues: ["Français", "Pular", "Anglais"], disponibilites: ["Lun 15:00", "Jeu 15:00"], couleur: "bg-indigo-600",
  },
  {
    id: "m5", nom: "Aïssatou Barry", titre: "Responsable marketing digital", organisation: "MTN Guinée", ville: "Conakry",
    domaines: ["marketing", "leadership"], competences: ["Réseaux sociaux", "Stratégie de marque", "Prise de parole", "Copywriting"],
    bio: "J'aide les jeunes professionnels et entrepreneurs à se rendre visibles et à construire leur marque personnelle.",
    experience: 9, langues: ["Français", "Soussou", "Anglais"], disponibilites: ["Mer 12:30", "Sam 11:00"], couleur: "bg-rose-600",
  },
  {
    id: "m6", nom: "Mamadou Kouyaté", titre: "Expert-comptable", organisation: "Cabinet KF Conseil", ville: "Kankan",
    domaines: ["finance", "entrepreneuriat"], competences: ["Comptabilité OHADA", "Fiscalité", "Gestion de trésorerie", "Microfinance"],
    bio: "J'accompagne les PME dans leur structuration financière. Mentor de plusieurs incubateurs en Haute-Guinée.",
    experience: 12, langues: ["Français", "Malinké"], disponibilites: ["Mar 18:30", "Ven 18:30"], couleur: "bg-teal-600",
  },
  {
    id: "m7", nom: "Dr Kadiatou Condé", titre: "Médecin de santé publique", organisation: "OMS – Bureau Guinée", ville: "Conakry",
    domaines: ["sante", "leadership"], competences: ["Santé publique", "Gestion de projet", "Rédaction de rapports", "Carrière internationale"],
    bio: "Je guide les étudiants en santé vers les carrières en ONG et organisations internationales.",
    experience: 14, langues: ["Français", "Anglais", "Soussou"], disponibilites: ["Sam 15:00"], couleur: "bg-fuchsia-600",
  },
  {
    id: "m8", nom: "Ousmane Touré", titre: "Juriste d'affaires", organisation: "Barreau de Guinée", ville: "Conakry",
    domaines: ["droit", "entrepreneuriat"], competences: ["Droit OHADA", "Contrats", "Création de société", "Propriété intellectuelle"],
    bio: "Avocat spécialisé en droit des affaires. Je démystifie les démarches juridiques pour les jeunes créateurs.",
    experience: 11, langues: ["Français", "Malinké", "Anglais"], disponibilites: ["Jeu 18:00", "Dim 10:00"], couleur: "bg-slate-600",
  },
];

export const ressources: Ressource[] = [
  { id: "r1", titre: "Réussir son premier entretien d'embauche", type: "Guide", domaine: "leadership", auteur: "Aïssatou Barry", resume: "Préparation, questions fréquentes, posture et suivi après l'entretien.", duree: "15 min" },
  { id: "r2", titre: "Rédiger un CV qui se démarque", type: "Modèle", domaine: "leadership", auteur: "Équipe LirePlus", resume: "Un modèle de CV commenté adapté au marché guinéen et international.", duree: "10 min" },
  { id: "r3", titre: "Du projet à l'entreprise : les 7 étapes", type: "Article", domaine: "entrepreneuriat", auteur: "Fatoumata Camara", resume: "Valider son idée, trouver ses premiers clients, formaliser son activité à l'APIP.", duree: "12 min" },
  { id: "r4", titre: "Introduction au machine learning en Python", type: "Vidéo", domaine: "data", auteur: "Ibrahima Sow", resume: "Les bases de scikit-learn à partir de données agricoles locales.", duree: "45 min" },
  { id: "r5", titre: "Trouver et obtenir une bourse de master", type: "Guide", domaine: "education", auteur: "Dr Alpha Oumar Bah", resume: "Calendrier, lettres de motivation, recommandations : la méthode complète.", duree: "20 min" },
  { id: "r6", titre: "Construire son portfolio de développeur", type: "Article", domaine: "dev", auteur: "Mariama Diallo", resume: "Quels projets montrer, comment utiliser GitHub et se faire remarquer.", duree: "8 min" },
  { id: "r7", titre: "Comptabilité de base pour entrepreneurs", type: "Podcast", domaine: "finance", auteur: "Mamadou Kouyaté", resume: "Tenir ses comptes simplement et éviter les erreurs fiscales courantes.", duree: "30 min" },
  { id: "r8", titre: "Business plan : modèle prêt à remplir", type: "Modèle", domaine: "entrepreneuriat", auteur: "Équipe LirePlus", resume: "Un modèle structuré avec exemples pour présenter son projet aux financeurs.", duree: "25 min" },
  { id: "r9", titre: "Statuts juridiques : SARL, SA, EI ?", type: "Article", domaine: "droit", auteur: "Ousmane Touré", resume: "Comparatif des formes juridiques OHADA pour bien démarrer.", duree: "10 min" },
  { id: "r10", titre: "Marketing digital avec un petit budget", type: "Vidéo", domaine: "marketing", auteur: "Aïssatou Barry", resume: "Facebook, WhatsApp Business et TikTok pour vendre localement.", duree: "35 min" },
];

export const opportunitesInitiales: Opportunite[] = [
  { id: "o1", titre: "Stage développeur web (6 mois)", type: "Stage", organisation: "Orange Digital Center", lieu: "Conakry", dateLimite: "2026-12-15", domaine: "dev", description: "Stage rémunéré en développement React/Node au sein de l'équipe produit.", publiePar: "Mariama Diallo" },
  { id: "o2", titre: "Concours national de startups agricoles", type: "Concours", organisation: "Ministère de l'Agriculture", lieu: "Guinée", dateLimite: "2026-12-01", domaine: "agri", description: "Prix de 50 millions GNF et incubation de 6 mois pour les 3 meilleurs projets.", publiePar: "Fatoumata Camara" },
  { id: "o3", titre: "Bourse de master en data science", type: "Bourse", organisation: "Campus France", lieu: "France", dateLimite: "2027-01-20", domaine: "data", description: "Bourse complète pour un master en science des données.", publiePar: "Dr Alpha Oumar Bah" },
  { id: "o4", titre: "Assistant(e) de projet santé", type: "Emploi", organisation: "ONG Santé Plus", lieu: "Labé", dateLimite: "2026-11-30", domaine: "sante", description: "CDD d'un an pour la coordination d'un programme de santé communautaire.", publiePar: "Dr Kadiatou Condé" },
  { id: "o5", titre: "Fonds d'amorçage jeunes entrepreneurs", type: "Financement", organisation: "FONIJ", lieu: "Guinée", dateLimite: "2027-02-28", domaine: "entrepreneuriat", description: "Prêts à taux zéro jusqu'à 100 millions GNF pour les entrepreneurs de moins de 35 ans.", publiePar: "Mamadou Kouyaté" },
  { id: "o6", titre: "Bootcamp marketing digital gratuit", type: "Formation", organisation: "MTN Academy", lieu: "En ligne", dateLimite: "2026-11-25", domaine: "marketing", description: "4 semaines de formation intensive avec certification.", publiePar: "Aïssatou Barry" },
];

export const profilInitial: Profil = {
  nom: "Invité",
  role: "mentore",
  ville: "Labé",
  domaines: ["dev", "entrepreneuriat"],
  competences: ["React", "Business plan"],
  besoins: "Je suis étudiant en informatique et je veux lancer une application pour les agriculteurs. Je cherche des conseils techniques et pour créer mon entreprise.",
  niveau: "Étudiant",
};

function dansJours(j: number, h = 18) {
  const d = new Date();
  d.setDate(d.getDate() + j);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}

export const seancesInitiales: Seance[] = [
  { id: "s1", mentorId: "m1", date: dansJours(2), sujet: "Revue de mon portfolio GitHub", format: "Visio", statut: "planifiee" },
  { id: "s2", mentorId: "m3", date: dansJours(-5, 17), sujet: "Valider mon idée de startup", format: "Présentiel", statut: "terminee" },
  { id: "s3", mentorId: "m4", date: dansJours(-12, 15), sujet: "Choisir un master", format: "Appel", statut: "terminee", note: 5, commentaire: "Très clair et bienveillant, plein de pistes concrètes." },
];

export const messagesInitiaux: Message[] = [
  { id: "msg1", mentorId: "m1", auteur: "mentor", texte: "Bonjour ! J'ai bien reçu ta demande. Envoie-moi le lien de ton GitHub avant notre séance.", date: dansJours(-1, 10) },
  { id: "msg2", mentorId: "m1", auteur: "moi", texte: "Merci beaucoup ! Le voici : github.com/mon-profil", date: dansJours(-1, 11) },
  { id: "msg3", mentorId: "m3", auteur: "mentor", texte: "Bravo pour la séance. Prochaine étape : interroger 10 agriculteurs cette semaine.", date: dansJours(-4, 9) },
];

export const objectifsInitiaux: Objectif[] = [
  {
    id: "g1", titre: "Décrocher un stage en développement web", echeance: dansJours(60), mentorId: "m1",
    etapes: [
      { id: "e1", titre: "Finaliser mon CV", fait: true },
      { id: "e2", titre: "Publier 3 projets sur GitHub", fait: true },
      { id: "e3", titre: "Préparer les entretiens techniques", fait: false },
      { id: "e4", titre: "Postuler à 10 offres", fait: false },
    ],
  },
  {
    id: "g2", titre: "Lancer le prototype de mon application agricole", echeance: dansJours(90), mentorId: "m3",
    etapes: [
      { id: "e5", titre: "Interroger 10 agriculteurs", fait: true },
      { id: "e6", titre: "Rédiger le business model canvas", fait: false },
      { id: "e7", titre: "Construire une maquette", fait: false },
    ],
  },
];

export function domaineNom(id: string) {
  return domaines.find((d) => d.id === id)?.nom ?? id;
}

export function initiales(nom: string) {
  return nom
    .replace(/^Dr\s+/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
