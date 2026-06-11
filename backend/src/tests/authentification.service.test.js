// Clé de chiffrement factice pour les tests (64 caractères hex = 32 octets)
process.env.ENCRYPTION_KEY = 'a'.repeat(64);

const authService = require('../services/authentification.service');
const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock des dépendances pour faire des tests unitaires purs (sans base de données)
jest.mock('../config/db', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn()
  }
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthentificationService', () => {
  beforeEach(() => {
    // Nettoie les compteurs d'appels entre chaque test
    jest.clearAllMocks();
  });

  describe('Méthode inscription()', () => {
    it('doit rejeter l\'inscription si l\'email est déjà utilisé', async () => {
      // On simule que Prisma trouve déjà un utilisateur avec cet email
      prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com' });
      
      await expect(authService.inscription('test@test.com', 'password123', 'Doe', 'John'))
        .rejects.toThrow("Cet email est déjà pris.");
        
      expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('doit créer un utilisateur et hacher le mot de passe si l\'email est libre', async () => {
      // On simule que l'email est libre
      prisma.user.findUnique.mockResolvedValue(null);
      
      // On simule les retours de bcrypt
      bcrypt.genSalt.mockResolvedValue('superSalt');
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      
      // On simule la création en base
      const fakeUser = { id: 2, email: 'nouveau@test.com' };
      prisma.user.create.mockResolvedValue(fakeUser);

      const result = await authService.inscription('nouveau@test.com', 'monMotDePasse', 'Doe', 'Jane');

      // Vérifications
      expect(bcrypt.hash).toHaveBeenCalledWith('monMotDePasse', 'superSalt');
      // nom et prenom sont maintenant chiffrés avant d'être stockés
      const appelCreate = prisma.user.create.mock.calls[0][0].data;
      expect(appelCreate.email).toBe('nouveau@test.com');
      expect(appelCreate.password).toBe('hashedPassword123');
      expect(appelCreate.nom).not.toBe('Doe');     // Chiffré → différent de la valeur originale
      expect(appelCreate.prenom).not.toBe('Jane'); // Chiffré → différent de la valeur originale
      expect(appelCreate.nom).toContain(':');       // Format iv:authTag:données
      expect(result).toEqual(fakeUser);
    });
  });

  describe('Méthode connexion()', () => {
    it('doit rejeter la connexion avec un email inexistant', async () => {
      prisma.user.findUnique.mockResolvedValue(null); // Pas d'utilisateur trouvé
      
      await expect(authService.connexion('inconnu@test.com', 'password123'))
        .rejects.toThrow("Identifiants invalides.");
    });

    it('doit rejeter la connexion avec un mauvais mot de passe', async () => {
      const fakeUser = { id: 1, email: 'test@test.com', password: 'hashedPassword' };
      prisma.user.findUnique.mockResolvedValue(fakeUser);
      
      // On simule que bcrypt.compare retourne false (mot de passe incorrect)
      bcrypt.compare.mockResolvedValue(false);
      
      await expect(authService.connexion('test@test.com', 'mauvaisPass'))
        .rejects.toThrow("Identifiants invalides.");
    });

    it('doit réussir la connexion et retourner un token valide', async () => {
      const fakeUser = { id: 1, email: 'test@test.com', password: 'hashedPassword' };
      prisma.user.findUnique.mockResolvedValue(fakeUser);
      bcrypt.compare.mockResolvedValue(true);
      
      process.env.JWT_SECRET = 'secret_test';
      jwt.sign.mockReturnValue('fake_jwt_token');

      const result = await authService.connexion('test@test.com', 'bonMotDePasse');

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: fakeUser.id },
        'secret_test',
        { expiresIn: '24h' }
      );
      expect(result).toHaveProperty('token', 'fake_jwt_token');
      expect(result).toHaveProperty('utilisateur', fakeUser);
    });
  });
});
