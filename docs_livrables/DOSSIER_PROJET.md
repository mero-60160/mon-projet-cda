# Dossier de Projet - Mini CRM (CDA)

## 1. Contexte du projet
Ce projet de Mini CRM a été réalisé pour valider mon titre de Concepteur Développeur d'Applications (CDA).

L'idée de départ vient d'un constat assez simple : beaucoup d'indépendants (artisans, freelances) gèrent encore leurs clients et leurs devis avec des fichiers Excel ou Word. C'est vite désorganisé, chronophage et propice aux erreurs (perte de fichiers, oublis de relances).

Le but était donc de créer une application web sur-mesure pour résoudre ce problème. Contrairement aux gros logiciels existants (ERP) qui sont souvent trop complexes et coûteux pour des indépendants, mon CRM se concentre sur l'essentiel : 
- Centraliser les contacts clients facilement.
- Créer des devis propres et les passer en facture en un clic.
- Avoir une vue d'ensemble rapide sur ce qui a été payé ou non.

## 2. Méthodologie de travail et Outils
Étant seul sur le développement de ce projet, j'ai choisi de m'organiser avec une méthode Agile inspirée du **Kanban**. Travailler avec des sprints stricts (Scrum) n'était pas forcément adapté à mon rythme, alors que le Kanban m'a permis d'avancer de manière plus fluide au fil de l'eau et de m'adapter aux retours.

### Gestion de la Backlog et suivi
Pour ne pas m'éparpiller, j'ai centralisé toutes mes tâches (User Stories et tâches techniques) dans un outil de gestion de projet. 
Mon tableau Kanban est divisé en colonnes simples :
- **À faire (Backlog) :** Toutes les fonctionnalités prévues (ex: transformer un devis en facture).
- **En cours :** La tâche sur laquelle je code actuellement. Je me force à n'avoir qu'une ou deux tâches en cours en même temps pour être sûr de finir ce que je commence.
- **Terminé :** Ce qui est codé, testé et validé.

### Démarche de développement et Qualité technique
- **Versionning (Git) :** Tout le code est versionné sur mon dépôt GitHub. Pour garder un historique propre et pro, j'utilise des petits commits réguliers en suivant la norme des "Conventional Commits" (ex: `feat: ajout route devis`, `fix: correction bug affichage`).
- **Découpage :** Avant de coder une grosse fonctionnalité, je rédige d'abord une User Story avec ses critères d'acceptation pour savoir exactement quand mon ticket est fini.
- **Intégration Continue :** J'ai aussi mis en place un pipeline CI/CD (avec GitHub Actions) pour que mes tests s'exécutent automatiquement quand j'envoie du nouveau code, ce qui m'assure de ne pas casser l'application.

