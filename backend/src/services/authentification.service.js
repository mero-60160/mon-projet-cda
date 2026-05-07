const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

class AuthentificationService {
  async inscription(email, motDePasse, nom, prenom) {
    const utilisateurExistant = await prisma.user.findUnique({ where: { email } });
    if (utilisateurExistant) {
      throw new Error("Cet email est déjà pris.");
    }

    const sel = await bcrypt.genSalt(10);
    const motDePasseHache = await bcrypt.hash(motDePasse, sel);

    const nouvelUtilisateur = await prisma.user.create({
      data: { 
        email, 
        password: motDePasseHache, 
        nom, 
        prenom 
      }
    });

    return nouvelUtilisateur;
  }

  async connexion(email, motDePasse) {
    const utilisateur = await prisma.user.findUnique({ where: { email } });
    if (!utilisateur) {
      throw new Error("Identifiants invalides.");
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.password);
    if (!motDePasseValide) {
      throw new Error("Identifiants invalides.");
    }

    const token = jwt.sign(
      { id: utilisateur.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { utilisateur, token };
  }
}

module.exports = new AuthentificationService();
