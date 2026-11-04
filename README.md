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

Les données sont stockées dans le navigateur (localStorage) : la démo fonctionne sans base de données.
Un bouton « Réinitialiser la démo » est disponible sur la page profil.

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
- Claude (`claude-opus-5-5`) via `@anthropic-ai/sdk` pour la recommandation de mentors

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
