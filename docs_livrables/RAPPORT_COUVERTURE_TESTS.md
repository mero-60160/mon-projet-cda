---
pdf_options:
  format: a4
  margin: 20mm 20mm 25mm 20mm
  printBackground: true
  displayHeaderFooter: true
  headerTemplate: |-
    <style>
      .header-container { width: 100%; text-align: center; font-size: 9px; font-family: 'Inter', sans-serif; color: #94a3b8; }
    </style>
    <div class="header-container"></div>
  footerTemplate: |-
    <style>
      .footer-container { width: 100%; text-align: center; font-size: 10px; font-family: 'Inter', sans-serif; color: #64748b; padding-bottom: 5px;}
    </style>
    <div class="footer-container">
      <span class="pageNumber"></span>
    </div>
  stylesheet: ./dossier_style.css
---

# Rapport de Couverture de Code et Tests Unitaires - M-Atici CRM

- **Date du rapport** : 28 mai 2026
- **Version** : 1.0.0
- **Technologie de test** : Jest (Framework de test JavaScript)
- **Couverture cible globale** : > 70%

## 1. Introduction

Pour garantir la fiabilité, la robustesse et la stabilité de l'application **M-Atici CRM** (spécifiquement sa partie back-end qui gère les données sensibles de facturation et de devis), une stratégie stricte de tests unitaires et d'intégration a été mise en place. 

Ce rapport fournit une synthèse de la couverture du code source (Code Coverage) obtenue à l'issue de l'exécution de la suite de tests automatique.

## 2. Résumé de l'Exécution des Tests

L'ensemble de la suite de tests a été exécuté avec succès. Aucun échec n'a été détecté.

- **Nombre total de suites de tests** : 7 (toutes réussies)
- **Nombre total de cas de tests** : 40 (tous réussis)
- **Statut final** : **SUCCÈS (100% passés)**
- **Durée d'exécution** : 0.43 s

## 3. Synthèse de la Couverture de Code

Le tableau ci-dessous présente le taux de couverture des instructions, des branches décisionnelles, des fonctions et des lignes pour chaque module de l'API.

| Module / Fichier | Instructions (Stmts %) | Branches (%) | Fonctions (%) | Lignes (%) |
| :--- | :--- | :--- | :--- | :--- |
| **Moyenne Globale (Tous les fichiers)** | **73.88 %** | **43.90 %** | **77.77 %** | **74.19 %** |
| `middlewares/authentification.middleware.js` | 100.00 % | 100.00 % | 100.00 % | 100.00 % |
| `services/authentification.service.js` | 100.00 % | 100.00 % | 100.00 % | 100.00 % |
| `services/clients.service.js` | 100.00 % | 100.00 % | 100.00 % | 100.00 % |
| `services/devis.service.js` | 51.16 % | 14.28 % | 66.66 % | 51.16 % |
| `services/email.service.js` | 58.82 % | 100.00 % | 66.66 % | 58.82 % |
| `services/factures.service.js` | 63.88 % | 31.25 % | 66.66 % | 64.70 % |
| `utils/calculDevis.js` | 100.00 % | 100.00 % | 100.00 % | 100.00 % |

<div class="page-break"></div>

## 4. Détail des Modules et Couverture de Code

### A. Middlewares et Services de Base (100% de couverture)
Les fichiers clés assurant la sécurité de l'application et la gestion de base des données ont été testés de manière exhaustive pour atteindre **100% de couverture de code** :
* **Authentification Middleware** : Validation de la présence et de l'intégrité des tokens JWT (cas valides, tokens expirés, tokens malformés).
* **Authentification Service** : Inscription, connexion, hachage sécurisé des mots de passe.
* **Clients Service** : Création, modification, suppression et listage des clients avec gestion de cache Redis (y compris l'invalidation automatique du cache lors des écritures).

### B. Moteurs Métiers de Calcul (100% de couverture)
* **Calcul Devis** : Les algorithmes de calcul mathématique (calcul du montant HT, application des taux de TVA variables de 20%, 10%, 5.5% et 0%, et calcul du montant TTC global) ont été validés à 100% avec des cas de tests complexes pour écarter tout risque d'erreur d'arrondi décimal.

### C. Services Métiers (de 50% à 65% de couverture)
Les services plus complexes interagissant avec des ressources externes (génération de documents PDF, envoi d'emails réels via SMTP) ont fait l'objet de mocking (simulations) pour tester leur comportement logique :
* **Factures Service** : Création d'une facture à partir d'un devis accepté, validation des contraintes d'unicité des numéros de facture.
* **Email Service** : Envoi de devis et alertes par email (validation des formats de destinataires, pièces jointes, templates de mail).
* **Devis Service** : Création, modification et suppression des devis.

## 5. Exécuter les Tests Localement

Pour lancer la suite de tests et afficher ce rapport de couverture dans la console, exécutez la commande suivante à la racine du projet :

```bash
# Pour le backend
npm test --prefix backend -- --coverage
```

Les rapports détaillés au format HTML interactif sont également disponibles sur le serveur dans le dossier `backend/coverage/lcov-report/index.html`.
