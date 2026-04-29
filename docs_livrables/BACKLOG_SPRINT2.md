# Backlog Sprint 2 - Mini CRM (M-Atici)

**Date de début :** Mai 2026
**Objectif du Sprint :** Facturation, Relances automatiques et Amélioration de l'Expérience Utilisateur.

---

## 1. Fonctionnalités Principales (User Stories)

### 1. Module Facturation
- **En tant qu'** utilisateur, **je veux** pouvoir transformer un devis "accepté" en facture **afin de** facturer mon client sans ressaisir les informations.
- **En tant qu'** utilisateur, **je veux** générer une facture PDF **afin de** l'envoyer à mon client.
- **En tant qu'** utilisateur, **je veux** suivre le statut des factures (en attente, payée, en retard) **afin de** piloter ma trésorerie.

### 2. Relances & Notifications
- **En tant qu'** utilisateur, **je veux** recevoir une alerte quand une facture est en retard **afin de** relancer le client.
- **En tant qu'** utilisateur, **je veux** avoir un bouton pour envoyer la relance par email automatiquement avec un template prédéfini.

### 3. Tableau de bord avancé
- **En tant qu'** utilisateur, **je veux** voir un graphique de mon chiffre d'affaires sur les 6 derniers mois **afin de** suivre mon évolution.
- **En tant qu'** utilisateur, **je veux** voir les "Top Clients" (qui génèrent le plus de CA).

## 2. Tâches Techniques & Dette
- Mise en place de Redis pour cacher le dashboard (optimisation).
- Implémentation d'une CI/CD (GitHub Actions) pour lancer les tests unitaires à chaque commit.
- Automatisation de la sauvegarde de la base de données PostgreSQL.
- Mise en place d'un service d'envoi d'emails (ex: Nodemailer + SendGrid/SMTP).
