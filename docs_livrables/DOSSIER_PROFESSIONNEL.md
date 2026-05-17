# Dossier Professionnel (DP) - Titre Concepteur Développeur d'Applications (CDA)

## 1. Présentation du candidat et Parcours professionnel

Mon parcours professionnel s'articule autour d'une double compétence : un fort sens de la relation client et de la gestion de projet, couplé à une solide expertise technique en développement Fullstack.

Avant de me spécialiser dans l'ingénierie logicielle, j'ai eu l'opportunité de développer mes "soft skills" (savoir-être) à travers plusieurs expériences significatives :
*   **Conseiller de Vente (Stage Erasmus+ chez CELIO, La Valette, Malte) :** Cette expérience internationale m'a permis de travailler au sein d'une équipe multiculturelle. J'y ai développé mon niveau d'anglais professionnel, ma capacité d'adaptation et le sens de l'accompagnement client.
*   **Stagiaire en Agence Immobilière (Stéphane Plaza Immobilier, Persan) :** J'y ai géré l'accueil physique et téléphonique, accompagné les clients lors de visites et participé à la prospection terrain. Cela m'a appris la rigueur administrative et l'écoute active des besoins clients.

Fort de ces compétences relationnelles, je me suis ensuite tourné vers ma passion : le développement web. Mon expérience en tant que **Développeur Web Fullstack (Stage chez OPIUM DIGITAL, Paris)** m'a permis de mettre en pratique et de consolider les compétences du titre CDA dans un environnement professionnel réel.

---

## 2. Fiches d'Activités Types

### Activité 1 : Développer et concevoir des interfaces utilisateur sécurisées
**Contexte de réalisation :** Stage en tant que Développeur Fullstack chez OPIUM DIGITAL (Paris) et réalisation de l'application Mini CRM (projet CDA).
**Description :**
Lors de ma mission chez Opium Digital et dans le cadre de mon projet Mini CRM, j'ai été chargé de la conception, du développement et du déploiement d'interfaces utilisateur interactives et sécurisées.
*   **Intégration et Front-end (Exemple concret) :** J'ai développé des interfaces complexes en React (Mini CRM) et Vue.js, en veillant à garantir une fidélité de 100% par rapport aux maquettes graphiques fournies (Figma). J'ai utilisé des bibliothèques modernes (Tailwind CSS, Vite) pour assurer le dynamisme, le responsive design et la fluidité de la navigation. Par exemple, sur le Mini CRM, j'ai conçu un tableau de bord dynamique affichant les devis et factures avec des filtres en temps réel.
*   **Qualité et Sécurité (Exemple concret) :** Pour garantir la robustesse des applications, j'ai mis en place des protections contre les vulnérabilités courantes (XSS, CSRF). L'authentification des utilisateurs est gérée de manière sécurisée via des tokens JWT stockés dans des cookies HTTP-Only. De plus, j'ai implémenté des tests unitaires et d'intégration (avec Jest et React Testing Library) pour valider le bon fonctionnement des composants clés (comme le formulaire de création de devis). Cette démarche préventive assure une expérience utilisateur sécurisée et sans faille.

### Activité 2 : Concevoir et développer la persistance des données et les composants métiers
**Contexte de réalisation :** Stage en tant que Développeur Fullstack chez OPIUM DIGITAL (Paris) et projet Mini CRM.
**Description :**
Au-delà de l'interface, mon rôle couvrait toute l'architecture logicielle de l'application, de la modélisation des données à la création des API.
*   **Bases de données (Exemple avec le Mini CRM) :** J'ai été responsable de la création du modèle de données (MCD/MLD) pour gérer les clients, devis et factures. J'ai implémenté ce modèle sur une base de données PostgreSQL en utilisant l'ORM Prisma. Prisma m'a permis de définir un schéma de données clair, de générer des migrations sécurisées et d'optimiser les requêtes SQL (par exemple pour calculer le total TTC d'un devis en fonction de ses lignes).
*   **Architecture Back-end (Exemple API REST) :** J'ai conçu et développé une API REST sécurisée avec Node.js et Express.js. Cette API centralise la logique métier. Par exemple, lors de la transformation d'un devis en facture, une route spécifique (`POST /api/factures/from-devis/:id`) vérifie les droits de l'utilisateur (middleware d'authentification JWT), s'assure que le devis est accepté, puis crée la facture correspondante en base de données de manière transactionnelle afin d'éviter toute perte de données en cas d'erreur.

### Activité 3 : Organiser le travail et préparer le déploiement
**Contexte de réalisation :** Stage en tant que Développeur Fullstack chez OPIUM DIGITAL (Paris).
**Description :**
Le travail au sein d'une agence digitale exige une organisation rigoureuse et un travail d'équipe fluide.
*   **Méthodologie Agile :** J'ai évolué dans un environnement nécessitant une collaboration Agile intensive. J'ai participé activement aux cérémonies Agile (réunions de suivi, stand-ups) pour garantir l'alignement de l'équipe sur les objectifs du sprint.
*   **Versionning et Déploiement :** J'ai utilisé quotidiennement Git pour le versionning de mon code (création de branches, Pull Requests, Code Review), ce qui m'a permis de m'intégrer parfaitement au pipeline de déploiement continu de l'agence.
