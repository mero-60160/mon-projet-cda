# Conception Technique : Module Devis & Tableau de bord

**Projet :** Mini CRM (M-Atici)
**Date :** 29 Avril 2026
**Objectif :** Finaliser la conception du module de création de devis (MVP) et du tableau de bord.

---

## 1. Description de la Fonctionnalité
Le module "Devis" permet aux utilisateurs de créer, d'éditer, de supprimer et de changer le statut des propositions commerciales. 
Il intègre également une fonctionnalité de génération de document PDF pour l'envoi aux clients.

## 2. Modèle de Données (Base de Données)
- **Table `Devis`** : `id`, `numero`, `totalHT`, `totalTTC`, `tva`, `statut` (brouillon, envoyé, accepté, refusé), `notes`, `clientId`, `userId`, `createdAt`.
- **Table `LigneDevis`** : `id`, `devisId`, `description`, `quantite`, `prixUnitaire`, `total`.
- **Relation** : Un devis appartient à un client et à un utilisateur. Un devis possède plusieurs lignes.

## 3. Architecture Logique (Backend)
- L'API expose des routes REST (GET, POST, PUT, DELETE, PATCH pour le statut).
- La génération PDF est effectuée côté serveur avec `puppeteer` pour garantir un rendu parfait des styles CSS (Chrome headless).
- Les calculs de montants (Total HT, TVA, Total TTC) sont effectués dans un module utilitaire dédié (`calculDevis.js`) qui est sécurisé par des tests unitaires (Jest).

## 4. Architecture UI (Frontend)
- **Pages/Devis.jsx** : Liste les devis avec un système de filtrage et un tableau dynamique.
- Modale de création avec calcul en direct du total.
- **Pages/Dashboard.jsx** : Synthèse de l'activité. Les KPIs (Chiffre d'Affaires généré, Devis en attente, etc.) sont calculés dynamiquement côté client à partir des données de l'API.

## 5. Sécurité
- Seul le propriétaire (via `userId` tiré du token JWT) peut voir et modifier ses devis.
- Vérification stricte des identifiants (IDs) côté serveur avant toute altération.
