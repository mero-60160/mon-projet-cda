# Livrable — Semaine 2
**Omer Atici · Projet Mini CRM · 09 Avril 2026**

## 1. Plan de sécurité (Défense en profondeur)
Afin d'assurer une sécurité optimale du Mini CRM, j'applique le principe de **défense en profondeur** (superposition de couches de sécurité) :

### A. Contrôle d'accès et Moindre Privilège
- **RBAC (Role-Based Access Control)** : Mise en place d'une gestion des rôles (ex: `User`, `Admin`). Chaque utilisateur a accès uniquement aux fonctionnalités strictement nécessaires à sa mission (Principe du moindre privilège). 
- **Isolation des données tenants** : Chaque requête SQL filtre systématiquement sur l'ID de l'utilisateur (`userId`), garantissant qu'un utilisateur ne peut en aucun cas voir les devis d'un autre (Cloisonnement logique).

### B. Sécurité Applicative et Authentification
- **Hashage fort** : Les mots de passe sont hashés avec `bcrypt` (avec un salt dynamique). Aucun mot de passe en clair.
- **Tokens Sécurisés (JWT)** : L'authentification repose sur des JSON Web Tokens éphémères (valides 24h) et transmis via l'en-tête `Authorization: Bearer`.
- **Validation stricte (Zod)** : Toutes les entrées utilisateurs (body, params) sont validées par `Zod` pour s'assurer du format et de la longueur, bloquant ainsi les payloads inattendus.
- **Protection contre l'Injection SQL** : L'ORM Prisma prépare nativement toutes ses requêtes, ce qui empêche techniquement les injections SQL.

### C. Sécurité de l'Infrastructure
- **Rate Limiting** : Limite fixée à 5 tentatives de connexion par 15 minutes par adresse IP pour contrer les attaques par force brute.
- **Gestion des Secrets** : Clés privées (JWT_SECRET) et URL de base de données sont externalisées dans un fichier `.env` non versionné.

## 2. Choix des technos Front / Back / BDD — Benchmark

### Front-End
| Framework | Facilité | Performance | Écosystème | Choix |
|---|---|---|---|---|
| Vue.js 3 | Facile | Très bonne | Vite, Pinia, Vue Router | ✅ Retenu |
| React | Moyenne | Excellente | Très riche | |
| Angular | Difficile | Bonne | Complet mais lourd | |

→ Je choisis **Vue.js 3** car c'est le framework que je maîtrise le mieux et sa syntaxe est claire et lisible.

### Back-End
| Framework | Facilité | Performance | Flexibilité | Choix |
|---|---|---|---|---|
| Node.js + Express | Facile | Très bonne | Totale | ✅ Retenu |
| NestJS | Difficile | Excellente | Bonne | |
| Django (Python) | Moyenne | Bonne | Limitée | |

→ Je choisis **Node.js + Express** car c'est du JavaScript comme le front, donc je garde le même langage sur tout le projet.

### Base de données
| BDD | Type | Adapté au CRM | ORM utilisé | Choix |
|---|---|---|---|---|
| PostgreSQL | SQL (relationnel) | Oui, parfait | Prisma | ✅ Retenu |
| MySQL | SQL (relationnel) | Oui | Prisma | |
| MongoDB | NoSQL | Non (données liées) | Mongoose | |

→ Je choisis **PostgreSQL** car les données du CRM sont relationnelles (un client a plusieurs devis, un devis a plusieurs lignes). PostgreSQL avec Prisma gère ça très bien.

## 3. Politique de sauvegarde et Conformité RGPD
Pour garantir la continuité de l'activité (PRA/PCA) et respecter la législation sur la protection des données (RGPD), la politique de sauvegarde suivante est appliquée :

- **Sauvegardes Quotidiennes (Backups à chaud)** : Un export complet (dump) de la base de données PostgreSQL est réalisé toutes les nuits. Les données sont chiffrées au repos (AES-256) sur le stockage cloud.
- **Politique de Rétention (Conformité RGPD)** : 
  - Les sauvegardes quotidiennes sont **conservées exactement 30 jours**. Au-delà, elles sont écrasées automatiquement. Cela garantit que si un utilisateur exerce son "droit à l'oubli", ses données disparaîtront définitivement de l'ensemble de notre système (y compris les archives) au bout d'un mois maximum.
  - Les logs de sécurité (tentatives de connexions) sont conservés pendant 6 mois maximum.
- **Restauration (RTO/RPO)** : L'objectif de point de reprise (RPO) est fixé à 24 heures (perte maximale de données) et le temps de reprise (RTO) est garanti en moins de 2 heures via un script de restauration automatisé.
- **Test d'intégrité** : Une fois par mois, un test de restauration est effectué sur une instance de pré-production isolée pour valider que les backups ne sont pas corrompus.

## 4. Roadmap prévisionnelle
Le projet est découpé en 4 phases sur 8 semaines :

**Phase 1 — Semaines 1 & 2 : Socle technique + Authentification**
- Mise en place du projet : Vue.js, Express, PostgreSQL, Docker
- Création du modèle User avec Prisma
- API de connexion et d'inscription
- Pages Login / Register côté front + protection des routes

**Phase 2 — Semaines 3 & 4 : Gestion des clients**
- Modèle Client en base (nom, email, téléphone, SIRET)
- API pour lister, ajouter, modifier et supprimer un client
- Page liste des clients avec recherche et formulaire d'ajout

**Phase 3 — Semaines 5 & 6 : Devis et export PDF**
- Modèle Devis en base avec les lignes de devis
- API CRUD pour les devis, avec statuts (Brouillon, Envoyé, Accepté)
- Formulaire de création de devis avec calcul automatique HT/TTC
- Export PDF du devis via Puppeteer

**Phase 4 — Semaines 7 & 8 : Dashboard et mise en ligne**
- Page dashboard avec les statistiques principales (CA, devis, clients)
- Audit de sécurité final
- Mise en place des sauvegardes automatiques
- Tests et déploiement de l'application
