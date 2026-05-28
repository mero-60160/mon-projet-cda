require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Début du peuplement (seed) de la base de données...');

  // 1. Nettoyage de la base de données existante
  await prisma.ligneFacture.deleteMany();
  await prisma.facture.deleteMany();
  await prisma.ligneDevis.deleteMany();
  await prisma.devis.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('Base de données nettoyée.');

  // 2. Création de mots de passe hachés
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('MotDePasse123!', salt);

  // 3. Création des Commerciaux (Users)
  const commercial1 = await prisma.user.create({
    data: {
      email: 'jean.dupont@minicrm.fr',
      password: passwordHash,
      nom: 'Dupont',
      prenom: 'Jean',
    },
  });

  const commercial2 = await prisma.user.create({
    data: {
      email: 'marie.curie@minicrm.fr',
      password: passwordHash,
      nom: 'Curie',
      prenom: 'Marie',
    },
  });

  console.log('2 commerciaux créés.');

  // 4. Création des Clients
  const client1 = await prisma.client.create({
    data: {
      nom: 'Martin',
      prenom: 'Paul',
      email: 'pmartin@entreprise-a.fr',
      telephone: '0612345678',
      entreprise: 'Entreprise A',
      adresse: '10 Rue de Paris, 75001',
      userId: commercial1.id,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      nom: 'Dubois',
      prenom: 'Sophie',
      email: 'sdubois@tech-world.com',
      telephone: '0698765432',
      entreprise: 'Tech World',
      adresse: '45 Avenue de Lyon, 69002',
      userId: commercial1.id, // Appartient aussi à commercial1
    },
  });

  const client3 = await prisma.client.create({
    data: {
      nom: 'Lefebvre',
      prenom: 'Luc',
      email: 'luc.lefebvre@start-up.fr',
      entreprise: 'Start-Up Inc',
      userId: commercial2.id, // Appartient à commercial2
    },
  });

  console.log('3 clients créés.');

  // 5. Création des Devis et de leurs Lignes
  const devis1 = await prisma.devis.create({
    data: {
      numero: 'DEV-2026-001',
      statut: 'accepté',
      tva: 20,
      totalHT: 1500,
      totalTTC: 1800, // (1500 * 1.20)
      notes: 'Prestation de développement web - Livraison fin de mois.',
      userId: commercial1.id,
      clientId: client1.id,
      lignes: {
        create: [
          { description: 'Création de la page vitrine', quantite: 1, prixUnitaire: 1000, total: 1000 },
          { description: 'Hébergement annuel', quantite: 1, prixUnitaire: 500, total: 500 },
        ],
      },
    },
  });

  const devis2 = await prisma.devis.create({
    data: {
      numero: 'DEV-2026-002',
      statut: 'brouillon',
      tva: 20,
      totalHT: 800,
      totalTTC: 960,
      userId: commercial1.id,
      clientId: client2.id,
      lignes: {
        create: [
          { description: 'Audit de sécurité', quantite: 1, prixUnitaire: 800, total: 800 },
        ],
      },
    },
  });

  const devis3 = await prisma.devis.create({
    data: {
      numero: 'DEV-2026-003',
      statut: 'envoyé',
      tva: 20,
      totalHT: 3000,
      totalTTC: 3600,
      notes: 'Maintenance serveur - contrat annuel.',
      userId: commercial2.id,
      clientId: client3.id,
      lignes: {
        create: [
          { description: 'Forfait maintenance', quantite: 12, prixUnitaire: 250, total: 3000 },
        ],
      },
    },
  });

  console.log('3 devis créés avec leurs lignes de prestation.');
  console.log('Le peuplement est terminé avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
