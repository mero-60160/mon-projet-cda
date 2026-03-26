FROM node:20

WORKDIR /app

# Copier tout le projet front
COPY . .

# Installer les dépendances
RUN npm install

EXPOSE 5173

# Lancer Vite pour qu'il soit accessible depuis l'extérieur du conteneur
CMD ["npm", "run", "dev", "--", "--host"]
