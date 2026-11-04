# LirePlus — Le mentorat à l'ère du numérique

> Connecter les talents, transmettre les expériences et construire les carrières de demain.

Plateforme web de mise en relation entre mentors et mentorés, développée pour le hackathon.

## Fonctionnalités

| Module | Page | Description |
|---|---|---|
| Connexion | `/connexion` | Connexion, inscription (mentor ou mentoré), mot de passe oublié avec lien par email (`/reinitialiser-mot-de-passe`) ; mot de passe solide, erreurs traduites |
| Identification des besoins | `/bienvenue` | Questionnaire d'accueil en 4 étapes (étape 1 du programme) : profil, domaines, attentes rattachées aux axes, format préféré ; charte d'engagement pour les mentors |
| Ateliers thématiques | `/ateliers` | Ateliers collectifs animés par les mentors (étape 4) : inscription, places restantes, visio de groupe |
| Témoignages | `/temoignages` | Restitution des expériences de mentorat (étape 7), publiées après les séances |
| Tableau de bord | `/` | Statistiques, mentors recommandés, prochaines séances, objectifs, opportunités |
| Profils | `/profil` | Profil mentoré (étudiant, jeune diplômé, entrepreneur, porteur de projet, reconversion…) ou **inscription comme mentor** (le mentor apparaît dans la recherche) |
| Recherche & mise en relation | `/mentors` | Filtres (texte, domaine, ville) + **recommandation par IA** (Claude) avec repli sur un algorithme local |
| Mise en relation | `/demandes` | **Demande de mentorat** (objectif + message) envoyée par le mentoré, **acceptée ou déclinée** par le mentor (étape 3) ; en temps réel |
| Profil mentor | `/mentors/[id]` | Bio, compatibilité, avis, ressources, demande de mentorat puis **réservation** (visio, chat ou présentiel) une fois la relation acceptée |
| Catalogue des domaines | `/domaines` | Les 7 domaines d'intervention des TDR et leurs sous-domaines, dont Culture/littérature et Campus France |
| Séances | `/seances` | Planification, suivi, annulation, **évaluation**, **plan d'action** transformé en objectif (« mettre en pratique les conseils reçus ») |
| Visio | `/seances/[id]/visio` | **Salle de visioconférence** intégrée (Jitsi Meet) avec chat de séance |
| Espace d'échange | `/messages` | Messagerie avec les mentors |
| Objectifs | `/objectifs` | **Parcours personnalisé généré par IA**, objectifs découpés en étapes, barre de progression |
| Ressources | `/ressources` | Bibliothèque de guides, vidéos, modèles, podcasts |
| Opportunités | `/opportunites` | Stages, emplois, bourses, concours, financements — publication par la communauté |

## Deux modes de fonctionnement

| | Mode démo | Mode multi-utilisateurs |
|---|---|---|
| Configuration | Aucune | Projet Supabase (gratuit) |
| Comptes | Oui, gardés dans ce navigateur (ou bouton « Continuer en invité ») | Inscription / connexion mentor ou mentoré, partagés en ligne |
| Données | Dans le navigateur | Base PostgreSQL partagée, sécurisée par RLS |
| Messages | Réponses simulées | Chat **en temps réel** entre vraies personnes |

Le mode est choisi automatiquement : si `NEXT_PUBLIC_SUPABASE_URL` est renseigné, l'app passe en multi-utilisateurs.
Le mode démo reste un filet de sécurité pour la présentation au jury.

### Activer le mode multi-utilisateurs (10 minutes)

1. Créer un compte et un projet sur https://supabase.com (région la plus proche : Europe).
2. **SQL Editor → New query** : coller le contenu de [`supabase/schema.sql`](supabase/schema.sql), puis **Run**.
3. Nouvelle requête : coller [`supabase/seed.sql`](supabase/seed.sql) (mentors et opportunités de démo), puis **Run**.
4. **Authentication → Sign In / Providers → Email** : désactiver **Confirm email** (pratique pendant le hackathon : pas d'email à valider).
5. **Project Settings → API Keys** : copier l'URL du projet, la clé *publishable* et la clé *secret* dans `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...      (serveur uniquement : ne jamais la partager)
   ```
6. **Authentication → URL Configuration** : *Site URL* = `http://localhost:3000` et ajouter `http://localhost:3000/**` dans *Redirect URLs*
   (ainsi que l'adresse du site une fois en ligne). Indispensable pour le lien « Mot de passe oublié ».
7. Relancer `pnpm dev`.

Pour tester l'interaction : créer un compte **mentor** dans un navigateur et un compte **mentoré** dans une fenêtre de
navigation privée (ou sur un téléphone), puis réserver une séance et échanger des messages.

Si les données de démo changent dans `src/shared/data.ts`, régénérer le seed : `node scripts/generer-seed.mjs`.

## Démarrage

```bash
pnpm install
pnpm add @anthropic-ai/sdk   # recommandation IA
cp .env.example .env.local   # puis renseigner ANTHROPIC_API_KEY (optionnel)
pnpm dev
```

Ouvrir http://localhost:3000.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4
- Supabase (PostgreSQL, authentification, temps réel) via `@supabase/supabase-js`
- Claude (`claude-opus-5-5`) via `@anthropic-ai/sdk` pour la recommandation de mentors et les parcours

## Structure

Vue d'ensemble (frontend, backend, base de données, GitHub) avec schémas : [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
Cahier des charges du hackathon : [docs/cahier-des-charges.md](docs/cahier-des-charges.md) ; ce qui est couvert : [docs/suivi-cahier-des-charges.md](docs/suivi-cahier-des-charges.md).

Un seul projet Next.js, organisé en trois couches :

```
src/
├─ app/                         Routes Next.js (fichiers courts, ils délèguent aux couches ci-dessous)
│  ├─ (frontend)/               Pages de l'application (le dossier entre parenthèses n'apparaît pas dans l'URL)
│  │  ├─ page.tsx               Tableau de bord
│  │  ├─ bienvenue/ profil/ connexion/ mentors/ seances/ ateliers/ messages/ …
│  └─ api/                      Points d'entrée du backend (HTTP)
│     ├─ profil/route.ts        PUT : valider et enregistrer le profil
│     ├─ profil/photo/route.ts  POST : vérifier et enregistrer la photo
│     ├─ demandes/              POST : demande de mentorat · [id] PATCH : réponse du mentor
│     ├─ recommandation/        POST : mentors recommandés par l'IA
│     └─ parcours/              POST : parcours personnalisé par l'IA
│
├─ frontend/                    Code exécuté dans le navigateur
│  ├─ components/               Composants d'interface (ui, Navigation, ChampPhoto…)
│  ├─ store/                    État de l'application : mode démo (localStorage) ou Supabase
│  └─ lib/                      Client Supabase navigateur, appels à l'API, traitement d'image
│
├─ backend/                     Code exécuté uniquement sur le serveur (protégé par "server-only")
│  ├─ db/supabase-admin.ts      Client Supabase avec la clé secrète
│  ├─ services/                 Logique métier : profils, authentification, IA (Claude)
│  └─ validation/               Contrôles propres au serveur (photos : taille, vrai format)
│
└─ shared/                      Code commun au frontend et au backend
   ├─ types.ts                  Types TypeScript
   ├─ data.ts                   Domaines, données de démonstration, charte, attentes
   ├─ matching.ts, parcours.ts  Algorithmes locaux (repli quand l'IA est indisponible)
   └─ validation/profil.ts      Règles de validation du profil (zod), appliquées des deux côtés
supabase/                       Schéma SQL (tables, règles RLS, stockage) et données de démo
scripts/                        Génération du seed SQL
```

### Création et modification du profil

1. Le formulaire (`/bienvenue` ou `/profil`) vérifie les champs **dans le navigateur** avec `shared/validation/profil.ts` pour un retour immédiat.
2. Il envoie le profil à **`PUT /api/profil`**. Le backend **revalide avec les mêmes règles** : c'est lui qui a le dernier mot.
3. En mode Supabase, le backend identifie l'utilisateur par son jeton, puis écrit en base avec la clé secrète.
   Les règles RLS **interdisent aux navigateurs de modifier les profils directement** : toute écriture passe par le backend.
4. La photo est recadrée et réduite dans le navigateur (320 px), puis envoyée à **`POST /api/profil/photo`**.
   Le serveur vérifie la taille (2 Mo maximum) et le **vrai format** du fichier (signature binaire JPEG, PNG ou WebP), puis la stocke dans Supabase Storage.
