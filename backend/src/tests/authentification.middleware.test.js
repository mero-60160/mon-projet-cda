const jwt = require('jsonwebtoken');
const middlewareAuth = require('../middlewares/authentification.middleware');

// On définit une clé secrète pour les tests
process.env.JWT_SECRET = 'cle_secrete_pour_tests';

describe('Middleware Authentification', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  it('devrait bloquer la requête si aucun token n\'est fourni', () => {
    middlewareAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Requête non authentifiée. Token manquant.'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait bloquer la requête si le token est invalide', () => {
    req.headers.authorization = 'Bearer token_completement_faux';

    middlewareAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Token invalide ou expiré.'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait laisser passer la requête avec un token JWT valide', () => {
    const token = jwt.sign({ id: 42 }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.headers.authorization = `Bearer ${token}`;

    middlewareAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.utilisateurId).toBe(42);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('devrait bloquer la requête si le token est expiré', () => {
    const tokenExpire = jwt.sign({ id: 5 }, process.env.JWT_SECRET, { expiresIn: '-1s' });
    req.headers.authorization = `Bearer ${tokenExpire}`;

    middlewareAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('devrait correctement extraire l\'ID utilisateur du token', () => {
    const token = jwt.sign({ id: 99 }, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;

    middlewareAuth(req, res, next);

    expect(req.utilisateurId).toBe(99);
  });
});
