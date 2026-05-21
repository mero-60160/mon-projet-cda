# Dossier de Projet - Mini CRM (Titre CDA)

## 1. Introduction et Contexte
Ce dossier de projet décrit la conception, le développement et le déploiement d'une application de type "Mini CRM" (Customer Relationship Management) réalisée dans le cadre de la certification Concepteur Développeur d'Applications (CDA).

### 1.1. Expression des besoins
Beaucoup d'indépendants (artisans, freelances) gèrent encore leurs portefeuilles clients, leurs devis et leurs facturations via des outils bureautiques classiques (Excel, Word). Cette approche manuelle est propice aux erreurs de saisie, à la perte de documents, et complexifie le suivi des paiements.
L'objectif est de fournir une solution logicielle sur-mesure, accessible en ligne (SaaS), qui permet :
- De centraliser la base de données clients.
- De générer rapidement des devis.
- De transformer d'un simple clic un devis accepté en facture officielle (avec numérotation automatisée).
- De disposer d'un tableau de bord de suivi (statuts : en attente, payée, en retard).

### 1.2. Méthodologie et Organisation
Le développement a suivi une approche Agile (Kanban). La traçabilité des évolutions est assurée par :
- Un tableau Kanban (Jira/Trello) pour suivre les *User Stories*.
- Un versionnement Git (GitHub) avec des commits atomiques respectant la convention *Conventional Commits*.

---

## 2. Spécifications Fonctionnelles (User Stories)

L'application couvre les parcours utilisateurs suivants (Périmètre MVP) :

- **US-01 - Authentification :** En tant que professionnel, je veux pouvoir m'inscrire et me connecter de manière sécurisée pour accéder à mon espace personnel.
- **US-02 - Gestion des clients :** En tant que professionnel, je veux pouvoir ajouter, modifier et lister mes clients (Nom, entreprise, contact).
- **US-03 - Création de Devis :** Je veux pouvoir créer un devis, lui attribuer un client, et ajouter plusieurs lignes de prestations avec calcul automatique du total HT et TTC.
- **US-04 - Facturation :** Je veux pouvoir convertir un devis "accepté" en facture officielle. Le système doit générer un numéro de facture unique (ex: `FACT-2026-001`).
- **US-05 - Export PDF :** Je veux pouvoir télécharger n'importe quel devis ou facture au format PDF afin de l'envoyer à mon client.

---

## 3. Conception de la Base de Données

Afin de garantir l'intégrité des données, une base de données relationnelle (PostgreSQL) a été modélisée.

### 3.1. Modèle Conceptuel des Données (MCD)
*   **User** gère de multiples `Client`, `Devis`, et `Facture`.
*   **Client** reçoit des `Devis` et doit payer des `Facture`.
*   **Devis** et **Facture** contiennent respectivement des `LigneDevis` et `LigneFacture`.
*   Un **Devis** peut engendrer (relation génère) une unique **Facture**.

*(Voir le diagramme `diagramme_mcd.mmd`)*

### 3.2. Dictionnaire de données (Extrait de l'implémentation Prisma)
- **User** : `id` (PK), `email` (Unique), `password` (Hashé), `nom`, `prenom`.
- **Client** : `id` (PK), `nom`, `prenom`, `email`, `entreprise`, `userId` (FK).
- **Devis / Facture** : `id` (PK), `numero` (Unique), `statut`, `dateEmission`, `totalHT`, `totalTTC`, `clientId` (FK).
- **Lignes** : `id` (PK), `description`, `quantite`, `prixUnitaire`, `total`, `devisId` / `factureId` (FK).

---

## 4. Choix Technologiques et Architecture Applicative

L'application repose sur une architecture "Fullstack JavaScript" découplée, séparant les responsabilités entre le Frontend (Client) et le Backend (Serveur).

### 4.1. Backend : API REST (Node.js & Express)
- **Framework :** Node.js avec Express.js pour concevoir l'API RESTful.
- **ORM :** Prisma. Ce choix garantit la sécurité typée (Type-safety) et génère des requêtes SQL optimisées et protégées contre les injections SQL.
- **Sécurité :** Mise en place d'une authentification par **JWT (JSON Web Tokens)** pour protéger les routes. Les mots de passe sont hashés via `bcrypt`.
- **Génération PDF :** Utilisation de `Puppeteer` (Headless Chrome) côté serveur pour convertir les vues HTML des factures en documents PDF prêts à l'impression.

### 4.2. Frontend : Interface Utilisateur (React.js & Vite)
- **Framework :** React.js (via Vite pour la rapidité de compilation).
- **Stylisation :** Utilisation de Tailwind CSS et de fichiers CSS (`index.css`) pour une conception responsive, moderne, et "Mobile-first".
- **Communication réseau :** Requêtes asynchrones vers l'API gérées par `Axios` avec intercepteurs pour injecter automatiquement le token JWT.

---

## 5. Infrastructure, Déploiement et DevOps

L'un des axes majeurs de ce projet CDA a été l'industrialisation du déploiement en production, en assurant sécurité, haute disponibilité et suivi des performances.

### 5.1. Serveur et Conteneurisation (Docker)
L'application est déployée sur un serveur privé virtuel (VPS) hébergé chez **OVH**.
L'ensemble de l'architecture est conteneurisée à l'aide de **Docker** et orchestrée via `docker-compose.yml`. Cela permet de garantir une isolement parfait des services :
- Un conteneur pour le Backend Node.js.
- Un conteneur pour le Frontend React.
- Un conteneur pour la base de données PostgreSQL.
- Un conteneur pour Redis (utilisé pour de l'optimisation/mise en cache).

### 5.2. Proxy Inversé et Sécurité TLS (Caddy)
Le point d'entrée public du serveur est géré par **Caddy Server** agissant comme reverse-proxy. 
- Il route automatiquement le trafic entrant vers le domaine `m-atici.fr`.
- Les requêtes préfixées par `/api/` sont redirigées vers le conteneur Backend.
- Le reste du trafic est servi par le Frontend.
- **TLS/SSL automatique :** Caddy gère de manière autonome la génération et le renouvellement des certificats Let's Encrypt, garantissant une connexion HTTPS sécurisée de bout en bout pour tous les utilisateurs.

### 5.3. Monitoring et Analyse de trafic
Un conteneur **GoAccess** a été couplé aux logs d'accès générés par Caddy. Il analyse les requêtes web en temps réel et génère un tableau de bord statistique accessible sur une route sécurisée de l'administration, permettant de visualiser la volumétrie du trafic et de détecter d'éventuelles anomalies.

### 5.4. Automatisation (Scripting Shell)
Un script de déploiement (`deploy-staging.sh`) automatise le processus de mise en production (Pull git, reconstruction des images Docker, application des migrations de base de données Prisma, et relance des services sans interruption de service majeure).
