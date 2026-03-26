# Projet CRM - Titre CDA

Ce dépôt contient le code source de l'application CRM développée dans le cadre de la certification Concepteur Développeur d'Applications (CDA).

L'application permet la gestion de clients, la création de devis et la facturation.

## Technologies utilisées

- **Backend** : Node.js, Express, Prisma (PostgreSQL)
- **Frontend** : React.js, Vite

## Structure du projet

Le dépôt est découpé en deux parties principales :
- `backend/` : contient l'API REST de l'application.
- `frontend/` : contient l'interface utilisateur.

## Lancement en dev (Local)

### 1. Installation des dépendances
Il faut installer les dépendances pour les deux parties du projet.

Depuis la racine :
```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Base de données et Backend

1. Créer un fichier `.env` à la racine du dossier `backend` et y renseigner les informations de connexion, par exemple :
   `DATABASE_URL="****************"`
   `JWT_SECRET="****************"`
   `PORT=3000`

2. Lancer les migrations Prisma pour initialiser la base de données :
   ```bash
   npx prisma db push
   ```

3. Démarrer le serveur backend :
   ```bash
   npm run dev
   ```

### 3. Frontend

1. Depuis le dossier `frontend`, démarrer le serveur de développement :
   ```bash
   npm run dev
   ```
2. L'application sera accessible sur `http://localhost:5173`.
