# Suivi du cahier des charges

Correspondance entre les [termes de référence](cahier-des-charges.md) et l'application LirePlus.
À mettre à jour à chaque fonctionnalité ajoutée.

Légende : ✅ fait · 🟡 partiel · ⬜ à faire

## Défi et profils (§2.3)

| Exigence | État | Où |
|---|---|---|
| Mise en relation mentors / mentorés | ✅ | `/mentors`, `/demandes` |
| Accompagnement **par chat** sur l'application | ✅ | `/messages` (temps réel en mode Supabase) |
| Accompagnement **par visio** sur l'application | ✅ | `/seances/[id]/visio` (Jitsi Meet intégré) |
| Profils : étudiants, jeunes diplômés, entrepreneurs, porteurs de projets, reconversion, nouvelles compétences | ✅ | `profilsBeneficiaires` (`shared/types.ts`), `/bienvenue`, `/profil` |

## Domaines (§5) et axes (§6)

| Exigence | État | Où |
|---|---|---|
| 7 domaines et leurs sous-domaines | ✅ | `/domaines`, `shared/data.ts` |
| Avertissement Campus France (ni admission ni visa garantis) | ✅ | `/domaines`, parcours IA |
| Liste extensible selon les mentors | ✅ | les mentors choisissent leurs domaines et compétences |
| Axes 1 à 3 reliés aux attentes des mentorés | ✅ | questionnaire `/bienvenue` (`attentesProgramme`) |
| Axe 4 : innovation numérique et accès au mentorat | ✅ | c'est la plateforme elle-même |

## Fonctionnalités envisagées (§7.2)

| Exigence | État | Où |
|---|---|---|
| Profils mentors et mentorés | ✅ | `/profil`, `/bienvenue`, photo de profil |
| Recherche et mise en relation selon compétences et besoins | ✅ | `/mentors` (filtres, compatibilité), `/demandes` |
| Catalogue des domaines d'expertise | ✅ | `/domaines` |
| Prise de rendez-vous et planification | ✅ | `/mentors/[id]` (réservation), `/seances` |
| Espace d'échange et de communication | ✅ | `/messages`, visio |
| Suivi des objectifs et de la progression | ✅ | `/objectifs` (étapes, barre de progression) |
| Bibliothèque de ressources et de conseils | ✅ | `/ressources` |
| Évaluation des séances | ✅ | `/seances` (note et commentaire) |
| Partage d'opportunités professionnelles et entrepreneuriales | ✅ | `/opportunites` (publication par la communauté) |
| IA : recommander des mentors | ✅ | `/mentors` (Claude, repli sur un algorithme local) |
| IA : orienter / personnaliser les parcours | ✅ | `/objectifs` (parcours généré, parcours types en repli) |

## Mentors (§9)

| Exigence | État | Où |
|---|---|---|
| Expérience professionnelle avérée | 🟡 | poste, organisation et années d'expérience obligatoires ; pas de vérification par l'organisation |
| Maîtrise du domaine | ✅ | domaines et compétences à transmettre obligatoires |
| Disponibilité | ✅ | disponibilités obligatoires, affichées sur la fiche |
| Bienveillance, transmission, autonomie du mentoré | ✅ | charte d'engagement obligatoire à l'inscription comme mentor |

## Déroulement (§10)

| Étape | État | Où |
|---|---|---|
| 1. Identification des besoins et des attentes | ✅ | `/bienvenue`, redirection automatique des nouveaux comptes |
| 2. Présentation des mentors et de leurs domaines | ✅ | `/mentors`, `/mentors/[id]`, `/domaines` |
| 3. Mise en relation | ✅ | demande de mentorat acceptée ou déclinée par le mentor |
| 4. Sessions de mentorat et ateliers thématiques | ✅ | `/seances`, `/ateliers` |
| 5. Conception et développement de la plateforme | ✅ | ce dépôt |
| 6. Tests, amélioration, finalisation | 🟡 | revue complète du 04/11 : 16 pages et parcours mentoré de bout en bout testés dans un navigateur, 3 bugs corrigés ; tests pas encore enregistrés dans le dépôt ; pas encore déployé en ligne |
| 7. Présentation des solutions et restitution des expériences | 🟡 | témoignages : `/temoignages` ; présentation au jury : voir §11 |

## Livrables (§11)

| Livrable | État | Où |
|---|---|---|
| 1. Prototype fonctionnel ou démontrable | ✅ | l'application (mode démo sans configuration, mode Supabase multi-utilisateurs) |
| 2. Présentation : problème, solution, utilisateurs cibles, fonctionnalités | ⬜ | — |
| 3. Démonstration du parcours utilisateur | ⬜ | scénario de démo à écrire |
| 4. Note de pérennisation : développement, accompagnement, déploiement | ⬜ | — |
| 5. Pitch devant le jury | ⬜ | — |

## Responsabilités des participants (§12)

| Exigence | État | Où |
|---|---|---|
| Définir ses objectifs d'accompagnement | ✅ | `/bienvenue`, `/objectifs` |
| Participer aux sessions | ✅ | `/seances`, `/ateliers` |
| Mettre en pratique les conseils reçus | ✅ | plan d'action après chaque séance, transformé en objectif |

## Pérennisation (§15)

| Exigence | État | Où |
|---|---|---|
| Réseau durable de mentors et mentorés | 🟡 | comptes partagés via Supabase ; à mettre en ligne |
| Élargir à d'autres secteurs | ✅ | domaines et compétences libres |
| Partenariats (entreprises, écoles, incubateurs…) | ⬜ | à décrire dans la note de pérennisation |

## Reste à faire, par priorité

1. **Livrable 3 : scénario de démonstration** du parcours utilisateur (mentoré, puis mentor), chronométré.
2. **Livrable 2 : présentation du projet**, qui sert de support au pitch (livrable 5).
3. **Livrable 4 : note de pérennisation**, avec les partenariats (§15) et l'accompagnement par Efficience Globale (§8).
4. **Mise en ligne** du prototype (Vercel + Supabase), pour que le jury puisse l'essayer.
5. **Tests automatisés** du parcours de connexion et de mise en relation (étape 6).
