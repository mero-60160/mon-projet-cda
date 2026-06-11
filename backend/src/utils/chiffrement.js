const crypto = require('crypto');

const ALGORITHME = 'aes-256-gcm';

function getCle() {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error('ENCRYPTION_KEY manquante ou invalide (doit être 64 caractères hexadécimaux).');
  }
  return Buffer.from(hex, 'hex');
}

// Chiffre un texte avec AES-256-GCM.
// Format de sortie : iv:authTag:donnéesChiffrées (tout en hexadécimal)
function chiffrer(texte) {
  if (!texte) return texte;
  const cle = getCle();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHME, cle, iv);
  let chiffre = cipher.update(texte, 'utf8', 'hex');
  chiffre += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${chiffre}`;
}

// Déchiffre une valeur produite par chiffrer().
// Retourne la valeur telle quelle si elle n'est pas au format attendu
// (compatibilité avec les données non chiffrées existantes en base).
function dechiffrer(valeur) {
  if (!valeur || !valeur.includes(':')) return valeur;
  try {
    const [ivHex, authTagHex, chiffre] = valeur.split(':');
    const cle = getCle();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHME, cle, iv);
    decipher.setAuthTag(authTag);
    let dechiffre = decipher.update(chiffre, 'hex', 'utf8');
    dechiffre += decipher.final('utf8');
    return dechiffre;
  } catch (_) {
    return valeur;
  }
}

module.exports = { chiffrer, dechiffrer };
