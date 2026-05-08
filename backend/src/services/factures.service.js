const prisma = require('../config/db');

class FacturesService {
  /**
   * Récupère la liste de toutes les factures de l'utilisateur
   */
  async obtenirFactures(utilisateurId) {
    return await prisma.facture.findMany({
      where: { userId: utilisateurId },
      include: { client: true, devis: true, lignes: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Crée une facture à partir d'un devis existant
   */
  async creerFactureDepuisDevis(identifiantDevis, utilisateurId) {
    // 1. Vérifier que le devis existe, appartient à l'utilisateur, et est "accepté"
    const devis = await prisma.devis.findFirst({
      where: { id: identifiantDevis, userId: utilisateurId },
      include: { lignes: true }
    });

    if (!devis) {
      throw new Error("Devis introuvable.");
    }
    if (devis.statut !== "accepté" && devis.statut !== "accepte") {
      throw new Error("Impossible de créer une facture : le devis n'est pas accepté.");
    }

    // 2. Vérifier si une facture n'existe pas déjà pour ce devis
    const factureExistante = await prisma.facture.findFirst({
      where: { devisId: identifiantDevis }
    });
    
    if (factureExistante) {
      throw new Error("Une facture existe déjà pour ce devis.");
    }

    // 3. Générer un numéro de facture unique
    const count = await prisma.facture.count();
    const numeroFacture = `FACT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    // 4. Copier les lignes
    const lignesFormatees = devis.lignes.map(ligne => ({
      description: ligne.description,
      quantite: ligne.quantite,
      prixUnitaire: ligne.prixUnitaire,
      total: ligne.total
    }));

    // Date d'échéance par défaut : +30 jours
    const dateEcheance = new Date();
    dateEcheance.setDate(dateEcheance.getDate() + 30);

    // 5. Créer la facture
    const nouvelleFacture = await prisma.facture.create({
      data: {
        numero: numeroFacture,
        statut: "en_attente",
        dateEcheance: dateEcheance,
        totalHT: devis.totalHT,
        totalTTC: devis.totalTTC,
        tva: devis.tva,
        notes: devis.notes,
        userId: utilisateurId,
        clientId: devis.clientId,
        devisId: devis.id,
        lignes: {
          create: lignesFormatees
        }
      },
      include: { lignes: true, client: true }
    });

    return nouvelleFacture;
  }

  /**
   * Modifier le statut d'une facture
   */
  async modifierStatutFacture(identifiantFacture, statut, utilisateurId) {
    const factureExistante = await prisma.facture.findFirst({
      where: { id: identifiantFacture, userId: utilisateurId }
    });

    if (!factureExistante) {
      throw new Error("Facture introuvable.");
    }

    return await prisma.facture.update({
      where: { id: identifiantFacture },
      data: { statut }
    });
  }

  /**
   * Générer le PDF d'une facture
   */
  async genererPDF(identifiantFacture, utilisateurId) {
    const puppeteer = require('puppeteer');
    const facture = await prisma.facture.findFirst({
      where: { id: identifiantFacture, userId: utilisateurId },
      include: { lignes: true, client: true, user: true }
    });

    if (!facture) throw new Error("Facture introuvable");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 2.5rem; font-weight: bold; color: #2563eb; }
            .info { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .info-box { width: 45%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8fafc; color: #475569; text-align: left; padding: 12px; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
            .totals { width: 50%; float: right; }
            .totals table { margin-bottom: 0; }
            .totals th { background: transparent; text-align: right; border-bottom: none; padding: 8px 12px; }
            .totals td { text-align: right; border-bottom: none; padding: 8px 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">FACTURE</div>
              <div style="font-size: 1.2rem; margin-top: 5px; color:#64748b;">N° ${facture.numero}</div>
              <div style="margin-top: 10px; padding: 4px 8px; background: #e2e8f0; border-radius: 4px; display: inline-block;">Statut: ${facture.statut.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div style="text-align: right;">
              <h2 style="margin:0;">Émetteur :</h2>
              <p style="margin:5px 0;">Consultant IT / Freelance</p>
              <p style="margin:5px 0;"><strong>${facture.user ? facture.user.prenom + ' ' + facture.user.nom : 'M-Atici CRM'}</strong></p>
            </div>
          </div>

          <div class="info">
            <div class="info-box">
              <h3 style="margin-top:0;">Facturé à :</h3>
              <p style="margin:2px 0;"><strong>${facture.client ? facture.client.entreprise || '' : ''}</strong></p>
              <p style="margin:2px 0;">${facture.client ? facture.client.prenom + ' ' + facture.client.nom : 'Client introuvable'}</p>
              <p style="margin:2px 0;">${facture.client ? facture.client.adresse || '' : ''}</p>
            </div>
            <div class="info-box" style="text-align: right;">
              <h3 style="margin-top:0;">Détails</h3>
              <p style="margin:2px 0;">Date d'émission: ${new Date(facture.createdAt).toLocaleDateString()}</p>
              <p style="margin:2px 0; font-weight: bold; color: ${new Date(facture.dateEcheance) < new Date() && facture.statut !== 'payée' ? '#dc2626' : 'inherit'}">Date d'échéance: ${new Date(facture.dateEcheance).toLocaleDateString()}</p>
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
              ${facture.lignes.map(l => `
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
                <td>${facture.totalHT.toFixed(2)} €</td>
              </tr>
              <tr>
                <th>TVA (${facture.tva}%) :</th>
                <td>${(facture.totalTTC - facture.totalHT).toFixed(2)} €</td>
              </tr>
              <tr>
                <th style="font-size: 1.2em;">TOTAL TTC :</th>
                <td style="font-size: 1.2em;"><strong>${facture.totalTTC.toFixed(2)} €</strong></td>
              </tr>
            </table>
          </div>
          
          ${facture.notes ? `<div style="margin-top: 40px; padding: 15px; background: #f8fafc; border-radius: 8px; clear: both;"><p style="margin:0;"><strong>Notes / Conditions :</strong><br><br>${facture.notes.replace(/\\n/g, '<br>')}</p></div>` : '<div style="clear: both;"></div>'}
        </body>
      </html>
    `;

    const executablePath = process.platform === 'darwin' 
      ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
      : '/usr/bin/chromium';

    const browser = await puppeteer.launch({ 
      executablePath,
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

    return { pdfBuffer, facture };
  }
}

module.exports = new FacturesService();
