const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async envoyerDevisParEmail(destinataire, numeroDevis, pdfBuffer) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Mini CRM SaaS" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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

      console.log(`Email devis envoyé à ${destinataire} (messageId: ${info.messageId})`);
      return { succes: true, messageId: info.messageId };
    } catch (erreur) {
      console.error("Erreur lors de l'envoi de l'email :", erreur);
      throw new Error("Impossible d'envoyer l'email.");
    }
  }

  async envoyerAlerteRetard(destinataire, numeroFacture, totalTTC, dateEcheance) {
    try {
      const info = await this.transporter.sendMail({
        from: `"M-Atici CRM" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: destinataire,
        subject: `RAPPEL : Facture en retard N° ${numeroFacture}`,
        text: `Bonjour,\n\nSauf erreur de notre part, le règlement de la facture N° ${numeroFacture} d'un montant de ${totalTTC} € (échéance le ${new Date(dateEcheance).toLocaleDateString()}) n'a pas été reçu.\n\nNous vous prions de bien vouloir procéder à son règlement dans les plus brefs délais.\n\nCordialement,\nL'équipe M-Atici`,
        html: `<p>Bonjour,</p><p>Sauf erreur de notre part, le règlement de la facture <strong>N° ${numeroFacture}</strong> d'un montant de <strong>${totalTTC} €</strong> (date d'échéance : ${new Date(dateEcheance).toLocaleDateString()}) n'a pas été reçu.</p><p>Nous vous prions de bien vouloir procéder à son règlement dans les plus brefs délais.</p><p>Cordialement,<br>L'équipe M-Atici</p>`
      });

      console.log(`Email de relance envoyé à ${destinataire} pour la facture ${numeroFacture} (messageId: ${info.messageId})`);
      return { succes: true, messageId: info.messageId };
    } catch (erreur) {
      console.error("Erreur lors de l'envoi de l'email de relance :", erreur);
      throw new Error("Impossible d'envoyer l'email de relance.");
    }
  }
}

module.exports = new EmailService();
