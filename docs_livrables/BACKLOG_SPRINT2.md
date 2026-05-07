# Backlog Sprint 2 - Mini CRM (M-Atici)

**Date de début :** Mai 2026
**Objectif du Sprint :** Facturation, Relances automatiques et Amélioration de l'Expérience Utilisateur.

---

## 1. Fonctionnalités Principales (User Stories & Critères d'acceptation)

### 1. Module Facturation
**US1 : Transformer un devis en facture**
- **En tant qu'** utilisateur, **je veux** pouvoir transformer un devis "accepté" en facture **afin de** facturer mon client sans ressaisir les informations.
- *Critères d'acceptation :*
  - Le bouton "Créer facture" n'est visible que si le devis a le statut "Accepté".
  - La facture générée reprend exactement les mêmes lignes, montants (HT, TTC) et le même client que le devis.
  - La facture se voit attribuer un numéro unique incrémenté (ex: FACT-2026-001).

**US2 : Générer un PDF de la facture**
- **En tant qu'** utilisateur, **je veux** générer une facture PDF **afin de** l'envoyer à mon client.
- *Critères d'acceptation :*
  - Un bouton "Télécharger PDF" est présent sur la vue détaillée d'une facture.
  - Le PDF contient les mentions légales obligatoires, les informations de l'entreprise, du client et le détail des prix.

**US3 : Suivi du statut des factures**
- **En tant qu'** utilisateur, **je veux** suivre le statut des factures (en attente, payée, en retard) **afin de** piloter ma trésorerie.
- *Critères d'acceptation :*
  - L'utilisateur peut modifier manuellement le statut d'une facture.
  - Les factures dépassants la date d'échéance passent automatiquement en "En retard".

### 2. Relances & Notifications
**US4 : Alerte de retard de paiement**
- **En tant qu'** utilisateur, **je veux** recevoir une alerte quand une facture est en retard **afin de** relancer le client.
- *Critères d'acceptation :*
  - Une pastille rouge apparaît sur le dashboard pour les factures échues non payées.

### 3. Tableau de bord fonctionnel (Roadmap)
**US5 : Visualisation du chiffre d'affaires**
- **En tant qu'** utilisateur, **je veux** voir le cumul de mon chiffre d'affaires mensuel sur le dashboard **afin de** suivre mon évolution.
- *Critères d'acceptation :*
  - Le dashboard affiche la somme des factures au statut "Payée" du mois en cours.

## 2. Tâches Techniques & Dette
- Mise en place de Redis pour cacher le dashboard (optimisation).
- Implémentation d'une CI/CD (GitHub Actions) pour lancer les tests unitaires à chaque commit.
- Automatisation de la sauvegarde de la base de données PostgreSQL.
- Mise en place d'un service d'envoi d'emails (ex: Nodemailer + SendGrid/SMTP).
