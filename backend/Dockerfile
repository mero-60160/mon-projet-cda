FROM node:20

WORKDIR /app

# 1. Dépendances système pour Chromium (couche lourde, quasi jamais modifiée → mise en cache)
RUN apt-get update && apt-get install -y \
    chromium libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libasound2 libpango-1.0-0 libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer utilise le Chromium système (/usr/bin/chromium) : inutile de télécharger le sien
ENV PUPPETEER_SKIP_DOWNLOAD=true

# 2. Dépendances Node.js (mises en cache tant que package.json ne change pas)
COPY package*.json ./
RUN npm install

# 3. Génération du client Prisma (mise en cache tant que le schéma ne change pas)
COPY prisma ./prisma
RUN npx prisma generate

# 4. Reste du code applicatif (seule couche réellement modifiée à chaque déploiement)
COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
