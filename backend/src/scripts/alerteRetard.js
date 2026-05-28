require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const emailService = require('../services/email.service');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Démarrage de la vérification des factures en retard...");
  const maintenant = new Date();
  
  // 1. Trouver toutes les factures "en_attente" dont la date d'échéance est dépassée
  const facturesEnRetard = await prisma.facture.findMany({
    where: {
      statut: "en_attente",
      dateEcheance: {
        lt: maintenant
      }
    },
    include: {
      client: true
    }
  });

  console.log(`Nombre de factures en retard détectées : ${facturesEnRetard.length}`);

  for (const facture of facturesEnRetard) {
    console.log(`Facture ${facture.numero} (Client: ${facture.client ? facture.client.nom : 'Inconnu'}) est en retard.`);

    // 2. Mettre à jour le statut en "en_retard"
    await prisma.facture.update({
      where: { id: facture.id },
      data: { statut: "en_retard" }
    });

    // 3. Envoyer l'email d'alerte si le client a un e-mail de contact
    if (facture.client && facture.client.email) {
      try {
        await emailService.envoyerAlerteRetard(
          facture.client.email,
          facture.numero,
          facture.totalTTC,
          facture.dateEcheance
        );
      } catch (erreurMail) {
        console.error(`Impossible d'envoyer l'email de relance pour la facture ${facture.numero}:`, erreurMail);
      }
    } else {
      console.log(`Pas d'email défini pour le client de la facture ${facture.numero}. Envoi ignoré.`);
    }
  }

  console.log("Vérification des factures et relances terminées avec succès.");
}

main()
  .catch(e => {
    console.error("Erreur critique dans le script alerteRetard :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
