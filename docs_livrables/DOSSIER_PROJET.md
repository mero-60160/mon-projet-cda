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

## 3. Fonctionnalités Réalisées (Sprint de Facturation)
Pour mon évaluation CDA, j'ai implémenté le système complet de facturation, découpé en deux grandes User Stories (US) :

### US1 : Transformer un devis en facture
*   **Backend :** Création du modèle `Facture` avec Prisma. Développement d'un service (`factures.service.js`) permettant de dupliquer automatiquement les lignes d'un devis accepté pour générer une facture unique (avec un numéro formaté type `FACT-2026-001`).
*   **Frontend :** Ajout d'une action "Générer la facture" sur les devis acceptés avec intégration React/Axios.

### US2 : Afficher et gérer les factures
*   **Frontend :** Création de l'interface `Factures.jsx` pour lister les factures, avec filtrage par client et gestion des statuts (en attente, payée, annulée).
*   **Génération PDF :** Implémentation côté Backend d'un générateur PDF avec Puppeteer (gérant dynamiquement le système d'exploitation de l'hôte ou du conteneur Docker Linux) permettant de télécharger instantanément la facture formatée en A4 depuis le Frontend.

## 4. Conception (Base de données et Architecture)

### 4.1. Modèle Conceptuel des Données (MCD)
La base de données relationnelle a été pensée pour répondre aux besoins de l'application sans complexité inutile.
**Règles de gestion principales :**
*   Un `User` gère plusieurs `Client` et crée plusieurs `Devis` et `Facture`.
*   Un `Client` est géré par un seul `User` et peut recevoir plusieurs `Devis` et `Facture`.
*   Un `Devis` (ou une `Facture`) appartient à un seul `Client`, est créé par un seul `User` et continent plusieurs `LigneDevis` (ou `LigneFacture`).

![Modèle Conceptuel des Données](./diagramme_mcd.png)

### 4.2. Dictionnaire de données (Extrait)
Voici un aperçu des entités principales :
*   **User** : L'utilisateur de l'application (l'indépendant). Il possède un `email` et un `password` (hashé avec bcrypt).
*   **Client** : Le contact du User. Il possède un `nom`, `prenom`, `email`, `telephone`, `entreprise`, etc.
*   **Devis** / **Facture** : Le document financier. Il possède un `numero` unique, un `statut`, une `dateEmission`, un `totalHT`, `totalTTC`, etc.
*   **LigneDevis** / **LigneFacture** : Le détail des prestations d'un document financier (`description`, `quantite`, `prixUnitaire`, `total`).

### 4.3. Diagramme de classes
Le diagramme de classes représente la structure des modèles métiers manipulés par l'application et les relations entre les différentes entités gérées par l'ORM Prisma.

![Diagramme de classes](./diagramme_classes.png)

### 4.4. Diagramme de Cas d'Utilisation
Il définit les interactions possibles entre l'utilisateur (l'artisan/freelance) et le système (le Mini CRM).

![Diagramme de cas d'utilisation](./diagramme_cas_utilisation.png)
