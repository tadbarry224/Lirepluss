# LirePlus — Le mentorat à l'ère du numérique

> Connecter les talents, transmettre les expériences et construire les carrières de demain.

Plateforme web de mise en relation entre mentors et mentorés, développée pour le hackathon.

## Fonctionnalités

| Module | Page | Description |
|---|---|---|
| Tableau de bord | `/` | Statistiques, mentors recommandés, prochaines séances, objectifs, opportunités |
| Profils | `/profil` | Profil mentoré (étudiant, jeune diplômé, entrepreneur, porteur de projet, reconversion…) ou **inscription comme mentor** (le mentor apparaît dans la recherche) |
| Recherche & mise en relation | `/mentors` | Filtres (texte, domaine, ville) + **recommandation par IA** (Claude) avec repli sur un algorithme local |
| Profil mentor | `/mentors/[id]` | Bio, compatibilité, avis, ressources, **réservation** en visio, chat ou présentiel |
| Catalogue des domaines | `/domaines` | Les 7 domaines d'intervention des TDR et leurs sous-domaines, dont Culture/littérature et Campus France |
| Séances | `/seances` | Planification, suivi, annulation, **évaluation par étoiles** |
| Visio | `/seances/[id]/visio` | **Salle de visioconférence** intégrée (Jitsi Meet) avec chat de séance |
| Espace d'échange | `/messages` | Messagerie avec les mentors |
| Objectifs | `/objectifs` | **Parcours personnalisé généré par IA**, objectifs découpés en étapes, barre de progression |
| Ressources | `/ressources` | Bibliothèque de guides, vidéos, modèles, podcasts |
| Opportunités | `/opportunites` | Stages, emplois, bourses, concours, financements — publication par la communauté |

## Deux modes de fonctionnement

| | Mode démo | Mode multi-utilisateurs |
|---|---|---|
| Configuration | Aucune | Projet Supabase (gratuit) |
| Comptes | Non (utilisateur « Invité ») | Inscription / connexion mentor ou mentoré |
| Données | Dans le navigateur | Base PostgreSQL partagée, sécurisée par RLS |
| Messages | Réponses simulées | Chat **en temps réel** entre vraies personnes |

Le mode est choisi automatiquement : si `NEXT_PUBLIC_SUPABASE_URL` est renseigné, l'app passe en multi-utilisateurs.
Le mode démo reste un filet de sécurité pour la présentation au jury.

### Activer le mode multi-utilisateurs (10 minutes)

1. Créer un compte et un projet sur https://supabase.com (région la plus proche : Europe).
2. **SQL Editor → New query** : coller le contenu de [`supabase/schema.sql`](supabase/schema.sql), puis **Run**.
3. Nouvelle requête : coller [`supabase/seed.sql`](supabase/seed.sql) (mentors et opportunités de démo), puis **Run**.
4. **Authentication → Sign In / Providers → Email** : désactiver **Confirm email** (pratique pendant le hackathon : pas d'email à valider).
5. **Project Settings → API Keys** : copier l'URL du projet et la clé *publishable* dans `.env.local` :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_KEY=sb_publishable_...
   ```
6. Relancer `pnpm dev`.

Pour tester l'interaction : créer un compte **mentor** dans un navigateur et un compte **mentoré** dans une fenêtre de
navigation privée (ou sur un téléphone), puis réserver une séance et échanger des messages.

Si les données de démo changent dans `src/lib/data.ts`, régénérer le seed : `node scripts/generer-seed.mjs`.

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

```
src/
  app/                    pages (une par module) + api/recommandation
  components/             Navigation, composants UI
  lib/
    data.ts               données de démonstration (mentors, domaines, ressources…)
    matching.ts           algorithme de compatibilité local
    store.tsx             état de l'application (React Context + localStorage)
    types.ts              types TypeScript
```
