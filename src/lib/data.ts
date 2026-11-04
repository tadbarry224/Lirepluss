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
export const APP_TAGLINE = "Connecter les talents, transmettre les expériences et construire les carrières de demain.";
export const EVENEMENT = "Hackathon d'innovation numérique · Salon international du livre de jeunesse de Conakry 2026";

export const AVERTISSEMENT_CAMPUS_FRANCE =
  "Cet accompagnement relève du conseil, de l'orientation et du partage d'expériences. Il ne garantit ni l'admission dans un établissement, ni l'obtention d'un visa.";

/** Domaines d'intervention du mentorat (TDR §5). */
export const domaines: Domaine[] = [
  {
    id: "entrepreneuriat", nom: "Entrepreneuriat et gestion d'entreprise", icone: "🚀",
    description: "Créer, structurer et développer son entreprise ou son projet.",
    sousDomaines: ["Création et développement d'entreprise", "Structuration de projets", "Gestion administrative et financière", "Recherche de financements", "Développement commercial"],
  },
  {
    id: "numerique", nom: "Numérique et technologies", icone: "💻",
    description: "Se former et évoluer dans les métiers du numérique.",
    sousDomaines: ["Développement informatique", "Intelligence artificielle", "Cybersécurité", "Marketing digital", "Design et création numérique"],
  },
  {
    id: "orientation", nom: "Orientation et insertion professionnelle", icone: "🧭",
    description: "Construire son parcours et décrocher son premier emploi.",
    sousDomaines: ["Construction du parcours professionnel", "Préparation aux entretiens d'embauche", "CV et lettre de motivation", "Recherche d'emploi et réseau professionnel", "Préparation à la vie en entreprise"],
  },
  {
    id: "culture", nom: "Culture, littérature et industries créatives", icone: "📚",
    description: "Écrire, éditer, créer et entreprendre dans la culture.",
    sousDomaines: ["Écriture et édition", "Métiers du livre", "Communication et création de contenu", "Production audiovisuelle", "Entrepreneuriat culturel et artistique"],
  },
  {
    id: "gestion", nom: "Gestion, finance et administration", icone: "📊",
    description: "Maîtriser la gestion, la finance et le management.",
    sousDomaines: ["Comptabilité et gestion", "Gestion de projets", "Management et ressources humaines", "Finance et analyse économique"],
  },
  {
    id: "leadership", nom: "Développement personnel et leadership", icone: "🌟",
    description: "Gagner en confiance, en aisance et en leadership.",
    sousDomaines: ["Prise de parole en public", "Confiance en soi", "Leadership et gestion d'équipe", "Gestion du temps et organisation", "Capacités relationnelles"],
  },
  {
    id: "campus", nom: "Accompagnement Campus France", icone: "🎓",
    description: "Préparer son projet d'études supérieures en France.",
    sousDomaines: ["Choix des formations et établissements", "Projet d'études et projet professionnel", "Dossier de candidature", "CV et lettre de motivation", "Entretien Campus France", "Démarches de mobilité étudiante", "Témoignages d'anciens étudiants"],
    avertissement: AVERTISSEMENT_CAMPUS_FRANCE,
  },
];

// Mentors de démonstration (personnes et organisations fictives).
export const mentors: Mentor[] = [
  {
    id: "m1", nom: "Mariama Diallo", titre: "Ingénieure logicielle senior", organisation: "Studio numérique Kaloum", ville: "Conakry",
    domaines: ["numerique", "orientation"], competences: ["Développement informatique", "React", "Node.js", "Préparation aux entretiens d'embauche"],
    bio: "10 ans d'expérience dans le développement web. J'accompagne les jeunes développeurs vers leur premier emploi et leurs projets open source.",
    experience: 10, langues: ["Français", "Pular", "Anglais"], disponibilites: ["Lun 18:00", "Mer 18:00", "Sam 10:00"], couleur: "bg-emerald-600",
  },
  {
    id: "m2", nom: "Ibrahima Sow", titre: "Data scientist & consultant IA", organisation: "Cabinet DataSahel", ville: "Conakry",
    domaines: ["numerique", "gestion"], competences: ["Intelligence artificielle", "Python", "Machine learning", "Finance et analyse économique"],
    bio: "Je conçois des modèles de prévision économique et j'aime rendre l'IA accessible aux étudiants guinéens.",
    experience: 7, langues: ["Français", "Anglais"], disponibilites: ["Mar 19:00", "Jeu 19:00"], couleur: "bg-sky-600",
  },
  {
    id: "m3", nom: "Fatoumata Camara", titre: "Fondatrice & directrice générale", organisation: "Fonio du Fouta", ville: "Labé",
    domaines: ["entrepreneuriat", "leadership"], competences: ["Création et développement d'entreprise", "Recherche de financements", "Business plan", "Pitch"],
    bio: "J'ai créé une entreprise de transformation de fonio au Fouta. J'aide les porteurs de projet à passer de l'idée au premier client.",
    experience: 8, langues: ["Français", "Pular"], disponibilites: ["Ven 17:00", "Sam 09:00"], couleur: "bg-amber-600",
  },
  {
    id: "m4", nom: "Dr Alpha Oumar Bah", titre: "Enseignant-chercheur, ancien étudiant en France", organisation: "Université de Labé", ville: "Labé",
    domaines: ["campus", "orientation"], competences: ["Projet d'études et projet professionnel", "Choix des formations et établissements", "Entretien Campus France", "CV et lettre de motivation"],
    bio: "Docteur de l'Université de Lyon, j'aide les étudiants à construire un projet d'études cohérent et à préparer leur candidature.",
    experience: 15, langues: ["Français", "Pular", "Anglais"], disponibilites: ["Lun 15:00", "Jeu 15:00"], couleur: "bg-indigo-600",
  },
  {
    id: "m5", nom: "Aïssatou Barry", titre: "Responsable marketing digital", organisation: "Agence Wakili Com", ville: "Conakry",
    domaines: ["numerique", "culture"], competences: ["Marketing digital", "Communication et création de contenu", "Réseaux sociaux", "Stratégie de marque"],
    bio: "J'aide les jeunes, les artistes et les entrepreneurs à se rendre visibles et à construire leur marque personnelle.",
    experience: 9, langues: ["Français", "Soussou", "Anglais"], disponibilites: ["Mer 12:30", "Sam 11:00"], couleur: "bg-rose-600",
  },
  {
    id: "m6", nom: "Mamadou Kouyaté", titre: "Expert-comptable", organisation: "Cabinet KF Conseil", ville: "Kankan",
    domaines: ["gestion", "entrepreneuriat"], competences: ["Comptabilité et gestion", "Gestion administrative et financière", "Fiscalité", "Gestion de projets"],
    bio: "J'accompagne les PME dans leur structuration financière et je mentore les incubés de plusieurs structures en Haute-Guinée.",
    experience: 12, langues: ["Français", "Malinké"], disponibilites: ["Mar 18:30", "Ven 18:30"], couleur: "bg-teal-600",
  },
  {
    id: "m7", nom: "Kadiatou Condé", titre: "Éditrice et autrice jeunesse", organisation: "Éditions Kolatier", ville: "Conakry",
    domaines: ["culture", "leadership"], competences: ["Écriture et édition", "Métiers du livre", "Prise de parole en public", "Entrepreneuriat culturel et artistique"],
    bio: "Autrice de 6 livres jeunesse et éditrice, je guide les jeunes plumes de l'écriture du manuscrit jusqu'à la publication.",
    experience: 14, langues: ["Français", "Soussou"], disponibilites: ["Sam 15:00", "Dim 10:00"], couleur: "bg-fuchsia-600",
  },
  {
    id: "m8", nom: "Ousmane Touré", titre: "Directeur des ressources humaines", organisation: "Groupe industriel Simandou Services", ville: "Conakry",
    domaines: ["orientation", "gestion"], competences: ["CV et lettre de motivation", "Préparation aux entretiens d'embauche", "Management et ressources humaines", "Recherche d'emploi et réseau professionnel"],
    bio: "J'ai recruté plus de 500 personnes. Je partage ce que les recruteurs attendent vraiment d'un candidat.",
    experience: 16, langues: ["Français", "Malinké", "Anglais"], disponibilites: ["Jeu 18:00", "Sam 14:00"], couleur: "bg-slate-600",
  },
  {
    id: "m9", nom: "Saran Keïta", titre: "Experte en cybersécurité", organisation: "SecuNet Afrique", ville: "Conakry",
    domaines: ["numerique"], competences: ["Cybersécurité", "Réseaux", "Sécurité des données", "Développement informatique"],
    bio: "Je protège les systèmes d'information d'entreprises et d'institutions. J'encourage les jeunes femmes à rejoindre la cybersécurité.",
    experience: 9, langues: ["Français", "Malinké", "Anglais"], disponibilites: ["Mer 19:00", "Sam 16:00"], couleur: "bg-cyan-700",
  },
  {
    id: "m10", nom: "Thierno Diallo", titre: "Réalisateur et producteur", organisation: "Fouta Films", ville: "Labé",
    domaines: ["culture", "entrepreneuriat"], competences: ["Production audiovisuelle", "Entrepreneuriat culturel et artistique", "Design et création numérique", "Recherche de financements"],
    bio: "Documentaires et séries web : je partage les ficelles de la production et du financement de projets culturels.",
    experience: 11, langues: ["Français", "Pular"], disponibilites: ["Ven 19:00", "Dim 15:00"], couleur: "bg-orange-600",
  },
  {
    id: "m11", nom: "Néné Sylla", titre: "Doctorante en biologie, ancienne candidate Campus France", organisation: "Université Paris-Saclay", ville: "Paris (à distance)",
    domaines: ["campus"], competences: ["Dossier de candidature", "Démarches de mobilité étudiante", "Témoignages d'anciens étudiants", "Entretien Campus France"],
    bio: "Arrivée en France en master il y a 4 ans, je raconte mon parcours et j'aide à préparer le dossier, l'entretien et l'installation.",
    experience: 4, langues: ["Français", "Soussou", "Anglais"], disponibilites: ["Mar 20:00", "Dim 18:00"], couleur: "bg-blue-700",
  },
  {
    id: "m12", nom: "Mohamed Lamine Camara", titre: "Coach certifié en développement personnel", organisation: "Cabinet Cap Leadership", ville: "Kindia",
    domaines: ["leadership", "orientation"], competences: ["Confiance en soi", "Prise de parole en public", "Gestion du temps et organisation", "Leadership et gestion d'équipe"],
    bio: "J'aide les jeunes à prendre confiance, à parler en public et à organiser leur temps pour atteindre leurs objectifs.",
    experience: 10, langues: ["Français", "Soussou", "Malinké"], disponibilites: ["Lun 19:00", "Jeu 12:30"], couleur: "bg-violet-600",
  },
];

export const ressources: Ressource[] = [
  { id: "r1", titre: "Réussir son premier entretien d'embauche", type: "Guide", domaine: "orientation", auteur: "Ousmane Touré", resume: "Préparation, questions fréquentes, posture et suivi après l'entretien.", duree: "15 min" },
  { id: "r2", titre: "Rédiger un CV qui se démarque", type: "Modèle", domaine: "orientation", auteur: "Équipe LirePlus", resume: "Un modèle de CV commenté adapté au marché guinéen et international.", duree: "10 min" },
  { id: "r3", titre: "Du projet à l'entreprise : les 7 étapes", type: "Article", domaine: "entrepreneuriat", auteur: "Fatoumata Camara", resume: "Valider son idée, trouver ses premiers clients, formaliser son activité.", duree: "12 min" },
  { id: "r4", titre: "Introduction à l'intelligence artificielle", type: "Vidéo", domaine: "numerique", auteur: "Ibrahima Sow", resume: "Comprendre l'IA et le machine learning à partir d'exemples locaux.", duree: "45 min" },
  { id: "r5", titre: "Construire son projet d'études en France", type: "Guide", domaine: "campus", auteur: "Dr Alpha Oumar Bah", resume: "Choisir ses formations, rendre son projet cohérent et préparer sa candidature.", duree: "20 min" },
  { id: "r6", titre: "Préparer l'entretien Campus France", type: "Podcast", domaine: "campus", auteur: "Néné Sylla", resume: "Les questions posées, comment présenter son parcours et les erreurs à éviter.", duree: "25 min" },
  { id: "r7", titre: "Comptabilité de base pour entrepreneurs", type: "Podcast", domaine: "gestion", auteur: "Mamadou Kouyaté", resume: "Tenir ses comptes simplement et éviter les erreurs fiscales courantes.", duree: "30 min" },
  { id: "r8", titre: "Business plan : modèle prêt à remplir", type: "Modèle", domaine: "entrepreneuriat", auteur: "Équipe LirePlus", resume: "Un modèle structuré avec exemples pour présenter son projet aux financeurs.", duree: "25 min" },
  { id: "r9", titre: "De l'idée au livre publié", type: "Guide", domaine: "culture", auteur: "Kadiatou Condé", resume: "Écrire, retravailler son manuscrit, trouver un éditeur ou s'autoéditer.", duree: "18 min" },
  { id: "r10", titre: "Marketing digital avec un petit budget", type: "Vidéo", domaine: "numerique", auteur: "Aïssatou Barry", resume: "Facebook, WhatsApp Business et TikTok pour se faire connaître localement.", duree: "35 min" },
  { id: "r11", titre: "Les bons réflexes de cybersécurité", type: "Article", domaine: "numerique", auteur: "Saran Keïta", resume: "Mots de passe, arnaques, protection des données : l'essentiel pour tous.", duree: "8 min" },
  { id: "r12", titre: "Vaincre le trac et parler en public", type: "Vidéo", domaine: "leadership", auteur: "Mohamed Lamine Camara", resume: "Exercices pratiques pour gagner en aisance à l'oral et réussir son pitch.", duree: "20 min" },
  { id: "r13", titre: "Financer un projet culturel", type: "Article", domaine: "culture", auteur: "Thierno Diallo", resume: "Subventions, coproduction, financement participatif : panorama des solutions.", duree: "12 min" },
];

export const opportunitesInitiales: Opportunite[] = [
  { id: "o1", titre: "Stage développeur web (6 mois)", type: "Stage", organisation: "Studio numérique Kaloum", lieu: "Conakry", dateLimite: "2026-12-15", domaine: "numerique", description: "Stage rémunéré en développement React/Node au sein de l'équipe produit.", publiePar: "Mariama Diallo" },
  { id: "o2", titre: "Concours de nouvelles jeunesse", type: "Concours", organisation: "Éditions Kolatier", lieu: "Guinée", dateLimite: "2026-12-20", domaine: "culture", description: "Écrivez une nouvelle pour la jeunesse : les 5 lauréats seront publiés dans un recueil.", publiePar: "Kadiatou Condé" },
  { id: "o3", titre: "Atelier collectif : préparer son dossier Campus France", type: "Formation", organisation: "Réseau de mentors LirePlus", lieu: "En ligne", dateLimite: "2026-11-28", domaine: "campus", description: "Deux heures pour structurer son projet d'études et relire ses lettres de motivation en groupe.", publiePar: "Néné Sylla" },
  { id: "o4", titre: "Chargé(e) de recrutement junior", type: "Emploi", organisation: "Groupe industriel Simandou Services", lieu: "Conakry", dateLimite: "2026-11-30", domaine: "gestion", description: "CDD d'un an au sein de la direction des ressources humaines.", publiePar: "Ousmane Touré" },
  { id: "o5", titre: "Fonds d'amorçage jeunes entrepreneurs", type: "Financement", organisation: "Fonds Jeunesse Entreprendre", lieu: "Guinée", dateLimite: "2027-02-28", domaine: "entrepreneuriat", description: "Prêts à taux zéro pour les entrepreneurs de moins de 35 ans.", publiePar: "Mamadou Kouyaté" },
  { id: "o6", titre: "Bootcamp cybersécurité pour les jeunes femmes", type: "Formation", organisation: "SecuNet Afrique", lieu: "Conakry", dateLimite: "2026-11-25", domaine: "numerique", description: "4 semaines de formation intensive avec certification.", publiePar: "Saran Keïta" },
];

export const profilInitial: Profil = {
  nom: "Invité",
  role: "mentore",
  ville: "Labé",
  domaines: ["numerique", "campus"],
  competences: ["Développement informatique"],
  besoins: "Je suis étudiant en informatique à Labé. Je veux améliorer mes compétences en développement et préparer un master en France via Campus France.",
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
  { id: "s3", mentorId: "m4", date: dansJours(-12, 15), sujet: "Choisir mes formations en France", format: "Visio", statut: "terminee", note: 5, commentaire: "Très clair et bienveillant, plein de pistes concrètes." },
];

export const messagesInitiaux: Message[] = [
  { id: "msg1", mentorId: "m1", auteur: "mentor", texte: "Bonjour ! J'ai bien reçu ta demande. Envoie-moi le lien de ton GitHub avant notre séance en visio.", date: dansJours(-1, 10) },
  { id: "msg2", mentorId: "m1", auteur: "moi", texte: "Merci beaucoup ! Le voici : github.com/mon-profil", date: dansJours(-1, 11) },
  { id: "msg3", mentorId: "m4", auteur: "mentor", texte: "Pour la prochaine fois, prépare une liste de 5 masters qui t'intéressent et on les compare ensemble.", date: dansJours(-4, 9) },
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
    id: "g2", titre: "Déposer ma candidature Campus France", echeance: dansJours(90), mentorId: "m4",
    etapes: [
      { id: "e5", titre: "Choisir 5 formations cohérentes avec mon projet", fait: true },
      { id: "e6", titre: "Rédiger mes lettres de motivation", fait: false },
      { id: "e7", titre: "Constituer le dossier de candidature", fait: false },
      { id: "e8", titre: "M'entraîner à l'entretien Campus France", fait: false },
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

/** Lien de salle de visioconférence d'une séance (Jitsi Meet, gratuit et sans installation). */
export function lienVisio(seanceId: string) {
  return `https://meet.jit.si/LirePlus-Mentorat-${seanceId}`;
}
