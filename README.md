# Histoire Futur Haïti

Application de découverte de l’histoire d’Haïti, de repères mondiaux et de lieux patrimoniaux. La chronologie haïtienne constitue le parcours principal. Les contenus de cette V1 sont embarqués dans l’application; aucun compte ni service distant n’est nécessaire pour les consulter.

## Lancer en local

Prérequis : Node.js 20.19+ (ou 22.12+).

```bash
npm ci
npm run dev
```

Ouvre l’adresse locale affichée par Vite. Pour produire les fichiers statiques :

```bash
npm run build
```

## Sources et images

Les sources sont indiquées directement dans chaque fiche. Les dates approximatives et les débats sont signalés. L’affectation à une année scolaire n’est montrée que lorsque le document pédagogique la confirme explicitement. Voir `src/data/curriculum-matrix.md` pour l’état du document du MENFP et les limites de provenance.

L’atlas utilise des images uniquement lorsque l’origine, l’attribution et la licence sont documentées dans `src/data/monuments.json`. Sinon, le visuel est clairement une illustration schématique, pas une photographie historique.

## Limites de cette V1

- Les contenus ne sont pas synchronisés avec un serveur et ne changent pas sans mise à jour de l’application.
- L’application est en français; son architecture laisse place à une version créole ultérieure.
- Les corpus éditoriaux sont une première sélection pédagogique, pas un manuel exhaustif. Les sources haïtiennes primaires et les travaux locaux doivent être renforcés avant publication large.
- Aucun déploiement public n’est configuré pour ce dossier.
