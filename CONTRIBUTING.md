# Travailler ensemble sur LirePlus

## Première installation

```bash
git clone git@github.com:<proprietaire>/lireplus.git
cd lireplus
pnpm install
cp .env.example .env.local   # optionnel : clé ANTHROPIC_API_KEY pour l'IA
pnpm dev
```

## Règle d'or : on ne pousse jamais directement sur `main`

`main` contient toujours une version qui fonctionne, prête pour la démo devant le jury.

## Le cycle de travail

1. **Se mettre à jour**
   ```bash
   git switch main
   git pull
   ```
2. **Créer une branche** pour sa tâche
   ```bash
   git switch -c feat/nom-de-la-tache
   ```
   Préfixes : `feat/` (nouvelle fonctionnalité), `fix/` (correction), `style/` (design), `docs/` (documentation).
3. **Coder, puis enregistrer** régulièrement
   ```bash
   git add .
   git commit -m "Ajoute le filtre par langue sur la recherche de mentors"
   ```
4. **Vérifier** avant d'envoyer
   ```bash
   pnpm lint
   pnpm build
   ```
5. **Envoyer sa branche** sur GitHub
   ```bash
   git push -u origin feat/nom-de-la-tache
   ```
6. **Ouvrir une Pull Request** vers `main` (sur github.com, ou `gh pr create`), puis demander une relecture à un coéquipier.
7. Une fois la PR approuvée, on la fusionne (**Squash and merge**) et on supprime la branche.

## En cas de conflit

Si `main` a avancé pendant que vous travailliez :

```bash
git switch main
git pull
git switch feat/ma-tache
git merge main
# résoudre les conflits dans VS Code, puis :
git add .
git commit
git push
```

## Répartition des fichiers

Le code est organisé en **frontend**, **backend** et **shared** (voir la section « Structure » du README).
Pour limiter les conflits, répartissez-vous ainsi :

| Rôle | Zone | Fichiers |
|---|---|---|
| Frontend | Profil et accueil | `src/app/(frontend)/profil/`, `src/app/(frontend)/bienvenue/`, `src/frontend/components/ChampPhoto.tsx` |
| Frontend | Recherche et mentors | `src/app/(frontend)/mentors/` |
| Frontend | Séances, visio, évaluations | `src/app/(frontend)/seances/` |
| Frontend | Ateliers, témoignages | `src/app/(frontend)/ateliers/`, `src/app/(frontend)/temoignages/` |
| Frontend | Messagerie, objectifs, ressources, opportunités | `src/app/(frontend)/messages/`, `objectifs/`, `ressources/`, `opportunites/` |
| Backend | API et services | `src/app/api/`, `src/backend/` |
| Backend | Base de données | `supabase/schema.sql`, `scripts/generer-seed.mjs` |
| Tous (prévenir l'équipe avant de modifier) | Code partagé | `src/shared/`, `src/frontend/store/`, `src/frontend/components/ui.tsx` |

**Règles :**
- Une page ne parle jamais directement à la base de données : elle passe par le store (`useStore()`), qui appelle l'API ou Supabase.
- Tout ce qui utilise une clé secrète va dans `src/backend/` (le paquet `server-only` empêche son import côté navigateur).
- Une règle de validation se modifie dans `src/shared/validation/` : elle s'applique alors au frontend et au backend.

## À ne jamais commiter

- `.env.local` et toute clé API (déjà exclus par `.gitignore`)
- `node_modules/` et `.next/`
