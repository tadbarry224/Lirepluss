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

Pour limiter les conflits, chacun travaille de préférence sur des pages différentes :

| Zone | Fichiers |
|---|---|
| Recherche et mentors | `src/app/mentors/` |
| Séances et évaluations | `src/app/seances/` |
| Messagerie | `src/app/messages/` |
| Objectifs | `src/app/objectifs/` |
| Ressources et opportunités | `src/app/ressources/`, `src/app/opportunites/` |
| IA | `src/app/api/recommandation/`, `src/lib/matching.ts` |
| Fichiers partagés (prévenir l'équipe avant de modifier) | `src/lib/types.ts`, `src/lib/store.tsx`, `src/lib/data.ts`, `src/components/` |

## À ne jamais commiter

- `.env.local` et toute clé API (déjà exclus par `.gitignore`)
- `node_modules/` et `.next/`
