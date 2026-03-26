FROM node:20

WORKDIR /app

# Copier tout le dossier
COPY . .

# Installer les librairies
RUN npm install

# Préparer Prisma pour la base de données
RUN npx prisma generate

EXPOSE 3000

# Lancer en mode dev
CMD ["npm", "run", "dev"]
