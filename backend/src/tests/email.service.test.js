const emailService = require('../services/email.service');

jest.mock('nodemailer', () => {
  return {
    createTransport: jest.fn().mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ messageId: 'abc-456' })
    }),
    getTestMessageUrl: jest.fn().mockReturnValue('http://fakeurl.com')
  };
});

describe('Email Service', () => {
  let sendMailMock;

  beforeEach(() => {
    const nodemailer = require('nodemailer');
    sendMailMock = nodemailer.createTransport().sendMail;
    sendMailMock.mockClear();
  });

  it("devrait retourner un succès et une URL lors de l'envoi d'un devis", async () => {
    const resultat = await emailService.envoyerDevisParEmail('client@example.com', 'DEV-2024-001', Buffer.from('fake-pdf'));

    expect(resultat.succes).toBe(true);
    expect(resultat.previewUrl).toBe('http://fakeurl.com');
  });

  it('devrait appeler sendMail avec le bon destinataire', async () => {
    await emailService.envoyerDevisParEmail('omer.atici@test.fr', 'DEV-101', Buffer.from('pdf'));

    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'omer.atici@test.fr'
    }));
  });

  it("devrait inclure le bon numéro de devis dans l'objet de l'email", async () => {
    await emailService.envoyerDevisParEmail('test@example.com', 'DEV-999', Buffer.from('pdf'));

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      subject: 'Votre devis N° DEV-999'
    }));
  });

  it('devrait attacher le PDF avec le bon nom de fichier', async () => {
    const fakePdf = Buffer.from('contenu-pdf-test');
    await emailService.envoyerDevisParEmail('test@example.com', 'DEV-2024-007', fakePdf);

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      attachments: expect.arrayContaining([
        expect.objectContaining({
          filename: 'Devis_DEV-2024-007.pdf',
          content: fakePdf,
          contentType: 'application/pdf'
        })
      ])
    }));
  });

  it("devrait propager une erreur si sendMail échoue", async () => {
    sendMailMock.mockRejectedValueOnce(new Error('Erreur SMTP'));

    await expect(emailService.envoyerDevisParEmail('test@example.com', 'DEV-123', Buffer.from('')))
      .rejects
      .toThrow("Impossible d'envoyer l'email.");
  });

  it('devrait appeler getTestMessageUrl avec les infos retournées par sendMail', async () => {
    const nodemailer = require('nodemailer');
    const fakeInfo = { messageId: 'xyz-789' };
    sendMailMock.mockResolvedValueOnce(fakeInfo);

    await emailService.envoyerDevisParEmail('test@example.com', 'DEV-200', Buffer.from('pdf'));

    expect(nodemailer.getTestMessageUrl).toHaveBeenCalledWith(fakeInfo);
  });
});
