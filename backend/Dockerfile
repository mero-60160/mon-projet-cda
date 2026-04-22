FROM node:20

WORKDIR /app

# Copier tout le dossier
COPY . .

# Installer les dépendances nécessaires pour Puppeteer/Chromium Linux
RUN apt-get update && apt-get install -y \
    chromium libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libasound2 libpango-1.0-0 libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Installer les librairies Node.js
RUN npm install

# Préparer Prisma pour la base de données
RUN npx prisma generate

EXPOSE 3000

# Lancer en mode dev
CMD ["npm", "run", "dev"]
