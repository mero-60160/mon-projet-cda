const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.EMAIL_USER || 'vladimir.wisozk1@ethereal.email',
        pass: process.env.EMAIL_PASS || 'GZgE1m12YnJ2gD2G8J'
      }
    });
  }

  async envoyerDevisParEmail(destinataire, numeroDevis, pdfBuffer) {
    try {
      const info = await this.transporter.sendMail({
        from: '"Mini CRM SaaS" <contact@m-atici.fr>',
        to: destinataire,
        subject: `Votre devis N° ${numeroDevis}`,
        text: `Bonjour,\n\nVeuillez trouver ci-joint votre devis N° ${numeroDevis}.\n\nCordialement,\nL'équipe M-Atici`,
        html: `<p>Bonjour,</p><p>Veuillez trouver ci-joint votre devis <strong>N° ${numeroDevis}</strong>.</p><p>Cordialement,<br>L'équipe M-Atici</p>`,
        attachments: [
          {
            filename: `Devis_${numeroDevis}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('Email envoyé avec succès ! URL de prévisualisation: %s', previewUrl);
      return { succes: true, previewUrl };
    } catch (erreur) {
      console.error("Erreur lors de l'envoi de l'email :", erreur);
      throw new Error("Impossible d'envoyer l'email.");
    }
  }

  async envoyerAlerteRetard(destinataire, numeroFacture, totalTTC, dateEcheance) {
    try {
      const info = await this.transporter.sendMail({
        from: '"M-Atici CRM" <contact@m-atici.fr>',
        to: destinataire,
        subject: `RAPPEL : Facture en retard N° ${numeroFacture}`,
        text: `Bonjour,\n\nSauf erreur de notre part, le règlement de la facture N° ${numeroFacture} d'un montant de ${totalTTC} € (échéance le ${new Date(dateEcheance).toLocaleDateString()}) n'a pas été reçu.\n\nNous vous prions de bien vouloir procéder à son règlement dans les plus brefs délais.\n\nCordialement,\nL'équipe M-Atici`,
        html: `<p>Bonjour,</p><p>Sauf erreur de notre part, le règlement de la facture <strong>N° ${numeroFacture}</strong> d'un montant de <strong>${totalTTC} €</strong> (date d'échéance : ${new Date(dateEcheance).toLocaleDateString()}) n'a pas été reçu.</p><p>Nous vous prions de bien vouloir procéder à son règlement dans les plus brefs délais.</p><p>Cordialement,<br>L'équipe M-Atici</p>`
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`Email de relance envoyé à ${destinataire} pour la facture ${numeroFacture} (URL: ${previewUrl})`);
      return { succes: true, previewUrl };
    } catch (erreur) {
      console.error("Erreur lors de l'envoi de l'email de relance :", erreur);
      throw new Error("Impossible d'envoyer l'email de relance.");
    }
  }
}

module.exports = new EmailService();
