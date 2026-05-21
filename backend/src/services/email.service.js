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
}

module.exports = new EmailService();
