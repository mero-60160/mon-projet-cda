const emailService = require('../services/email.service');


jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: '123' })
    }),
    getTestMessageUrl: jest.fn().mockReturnValue('http://fakeurl.com')
  };
});

describe('Email Service', () => {
  it('devrait retourner un succès et une URL lors de l\'envoi d\'un devis', async () => {
    const destinataire = 'test@example.com';
    const numeroDevis = 'DEV-123';
    const pdfBuffer = Buffer.from('fake-pdf');

    const resultat = await emailService.envoyerDevisParEmail(destinataire, numeroDevis, pdfBuffer);

    expect(resultat.succes).toBe(true);
    expect(resultat.previewUrl).toBe('http://fakeurl.com');
  });

  it('devrait propager une erreur si sendMail échoue', async () => {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport();
    transporter.sendMail.mockRejectedValueOnce(new Error('Erreur SMTP'));

    await expect(emailService.envoyerDevisParEmail('test@example.com', 'DEV-123', Buffer.from('')))
      .rejects
      .toThrow("Impossible d'envoyer l'email.");
  });
});
