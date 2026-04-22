const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const puppeteer = require('puppeteer');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Récupère les devis de l'utilisateur avec le détail client et lignes
 */
exports.obtenirDevis = async (req, res) => {
  try {
    const listeDevis = await prisma.devis.findMany({
      where: { userId: req.utilisateurId },
      include: { client: true, lignes: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(listeDevis);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur (lecture des devis)." });
  }
};

/**
 * Crée un devis complet avec calcul des totaux et lignes
 */
exports.creerDevis = async (req, res) => {
  try {
    const { clientId, numero, notes, lignes } = req.body;
    let totalHT = 0;

    // Formatage des lignes et calcul du sous-total
    const lignesFormatees = lignes.map(ligne => {
      const totalLigne = ligne.quantite * ligne.prixUnitaire;
      totalHT += totalLigne;
      return {
        description: ligne.description,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        total: totalLigne
      };
    });

    const tva = 20;
    const totalTTC = totalHT * 1.20; // 20% TVA

    // Transaction Prisma : Création du devis et des lignes
    const nouveauDevis = await prisma.devis.create({
      data: {
        numero,
        totalHT,
        totalTTC,
        tva,
        notes,
        userId: req.utilisateurId,
        clientId,
        lignes: { create: lignesFormatees }
      },
      include: { lignes: true, client: true }
    });

    res.status(201).json(nouveauDevis);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur (création du devis)." });
  }
};

/**
 * Supprime un devis
 */
exports.supprimerDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);

    const devisExistant = await prisma.devis.findFirst({
      where: { id: identifiantDevis, userId: req.utilisateurId }
    });

    if (!devisExistant) {
      return res.status(404).json({ message: "Devis introuvable." });
    }

    await prisma.devis.delete({ where: { id: identifiantDevis } });
    res.json({ message: "Devis supprimé de la base." });
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur (suppression du devis)." });
  }
};

/**
 * Modifie un devis existant et ses lignes
 */
exports.modifierDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);
    const { clientId, numero, notes, lignes, statut } = req.body;
    let totalHT = 0;

    const devisExistant = await prisma.devis.findFirst({
      where: { id: identifiantDevis, userId: req.utilisateurId }
    });

    if (!devisExistant) {
      return res.status(404).json({ message: "Devis introuvable." });
    }

    // Formatage des lignes et calcul du sous-total
    const lignesFormatees = lignes.map(ligne => {
      const totalLigne = ligne.quantite * ligne.prixUnitaire;
      totalHT += totalLigne;
      return {
        description: ligne.description,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
        total: totalLigne
      };
    });

    const tva = 20;
    const totalTTC = totalHT * 1.20;

    // Mise à jour du devis : on supprime les anciennes lignes et on recrée les nouvelles
    const devisMisAJour = await prisma.devis.update({
      where: { id: identifiantDevis },
      data: {
        numero,
        totalHT,
        totalTTC,
        tva,
        notes,
        statut: statut || devisExistant.statut,
        clientId,
        lignes: {
          deleteMany: {}, // Supprime toutes les lignes actuelles
          create: lignesFormatees // Crée les nouvelles lignes
        }
      },
      include: { lignes: true, client: true }
    });

    res.json(devisMisAJour);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur (modification du devis)." });
  }
};

/**
 * Modifie uniquement le statut d'un devis existant
 */
exports.modifierStatutDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);
    const { statut } = req.body;

    const devisExistant = await prisma.devis.findFirst({
      where: { id: identifiantDevis, userId: req.utilisateurId }
    });

    if (!devisExistant) {
      return res.status(404).json({ message: "Devis introuvable." });
    }

    const devisMisAJour = await prisma.devis.update({
      where: { id: identifiantDevis },
      data: { statut }
    });

    res.json(devisMisAJour);
  } catch (erreur) {
    res.status(500).json({ message: "Erreur serveur (modification du statut)." });
  }
};

/**
 * Génère le PDF d'un devis
 */
exports.genererPDFDevis = async (req, res) => {
  try {
    const identifiantDevis = parseInt(req.params.id);
    const devis = await prisma.devis.findFirst({
      where: { id: identifiantDevis, userId: req.utilisateurId },
      include: { 
        client: true, 
        lignes: true, 
        user: true 
      }
    });

    if (!devis) {
      return res.status(404).json({ message: "Devis introuvable." });
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .title { font-size: 32px; font-weight: bold; color: #3b82f6; }
            .info { margin-top: 30px; display: flex; justify-content: space-between; }
            .info-box { padding: 15px; border-radius: 8px; width: 45%; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: bold; }
            .totals { flex-direction: column; align-items: flex-end; margin-top: 20px; }
            .totals table { width: 40%; margin-left: auto; border: none;}
            .totals th, .totals td { text-align: right; border: none; padding: 6px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">DEVIS</div>
              <div style="font-size: 1.2rem; margin-top: 5px; color:#64748b;">N° ${devis.numero}</div>
              <div style="margin-top: 10px; padding: 4px 8px; background: #e2e8f0; border-radius: 4px; display: inline-block;">Statut: ${devis.statut.toUpperCase()}</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin:0;">Émetteur :</h2>
              <p style="margin:5px 0;">Consultant IT / Freelance</p>
              <p style="margin:5px 0;"><strong>${devis.user ? devis.user.prenom + ' ' + devis.user.nom : 'M-Atici CRM'}</strong></p>
            </div>
          </div>

          <div class="info">
            <div class="info-box">
              <h3 style="margin-top:0;">Adressé à :</h3>
              <p style="margin:2px 0;"><strong>${devis.client ? devis.client.entreprise || '' : ''}</strong></p>
              <p style="margin:2px 0;">${devis.client ? devis.client.prenom + ' ' + devis.client.nom : 'Client introuvable'}</p>
              <p style="margin:2px 0;">${devis.client ? devis.client.adresse || '' : ''}</p>
            </div>
            <div class="info-box" style="text-align: right;">
              <h3 style="margin-top:0;">Détails</h3>
              <p style="margin:2px 0;">Date d'émission: ${new Date(devis.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align:center;">Quantité</th>
                <th style="text-align:right;">Prix U. HT</th>
                <th style="text-align:right;">Total HT</th>
              </tr>
            </thead>
            <tbody>
              ${devis.lignes.map(l => `
                <tr>
                  <td>${l.description}</td>
                  <td style="text-align:center;">${l.quantite}</td>
                  <td style="text-align:right;">${l.prixUnitaire.toFixed(2)} €</td>
                  <td style="text-align:right;">${l.total.toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <table>
              <tr>
                <th>Sous-total HT :</th>
                <td>${devis.totalHT.toFixed(2)} €</td>
              </tr>
              <tr>
                <th>TVA (${devis.tva}%) :</th>
                <td>${(devis.totalTTC - devis.totalHT).toFixed(2)} €</td>
              </tr>
              <tr>
                <th style="font-size: 1.2em;">TOTAL TTC :</th>
                <td style="font-size: 1.2em;"><strong>${devis.totalTTC.toFixed(2)} €</strong></td>
              </tr>
            </table>
          </div>
          
          ${devis.notes ? `<div style="margin-top: 40px; padding: 15px; background: #f8fafc; border-radius: 8px;"><p style="margin:0;"><strong>Notes / Conditions :</strong><br><br>${devis.notes.replace(/\\n/g, '<br>')}</p></div>` : ''}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="devis-${devis.numero}.pdf"`,
      'Content-Length': pdfBuffer.length
    });
    
    res.send(pdfBuffer);
  } catch (erreur) {
    console.error(erreur);
    res.status(500).json({ message: "Erreur serveur (génération du PDF)." });
  }
};
