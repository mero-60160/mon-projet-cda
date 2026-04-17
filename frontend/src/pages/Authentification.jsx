import { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import axios from 'axios';

/**
 * Composant de champ de texte réutilisable pour les formulaires.
 * Permet de factoriser le rendu des champs avec leurs icônes.
 */
const ChampTexte = ({ etiquette, type, valeur, modification, Icone, placeholder }) => (
  <div className="formulaire-groupe">
    <label className="formulaire-etiquette">{etiquette}</label>
    <div className="champ-avec-icone">
      <Icone className="icone-champ" size={18} />
      <input type={type} className="formulaire-champ" value={valeur} onChange={(e) => modification(e.target.value)} required placeholder={placeholder} />
    </div>
  </div>
);

/**
 * Page Principale d'Authentification
 */
export default function Authentification({ onLoginSuccess }) {
  const [estInscription, setEstInscription] = useState(false);
  const [formulaire, setFormulaire] = useState({ email: '', motDePasse: '', nom: '', prenom: '' });
  const [erreur, setErreur] = useState('');

  // Fonction utilitaire pour mettre à jour une seule case du formulaire sans effacer les autres
  const modifierChamp = (champ, valeur) => setFormulaire({ ...formulaire, [champ]: valeur });

  // Soumission à l'API Backend
  const gererSoumission = async (e) => {
    e.preventDefault();
    try {
      if (estInscription) {
        // Appelle la route /inscription du backend
        await axios.post('http://localhost:3000/api/authentification/inscription', formulaire);
        alert("Succès ! Veuillez vous connecter avec votre nouveau compte.");
        setEstInscription(false);
      } else {
        // Appelle la route /connexion du backend
        const reponse = await axios.post('http://localhost:3000/api/authentification/connexion', {
          email: formulaire.email,
          motDePasse: formulaire.motDePasse
        });

        // Sauvegarde le profil et déclenche l'entrée dans le dashboard
        localStorage.setItem('crm_token', reponse.data.token);
        localStorage.setItem('crm_user', JSON.stringify({ nom: reponse.data.nom, prenom: reponse.data.prenom }));
        onLoginSuccess();
      }
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur de connexion au serveur.");
    }
  };

  // Rendu de l'interface utilisateur
  return (
    <div className="page-authentification">
      <div className="conteneur-authentification">

        <div className="entete-authentification">
          <h1>M-Atici</h1>
          <p>La solution de gestion globale pour les professionnels.</p>
        </div>

        <div className="carte-premium">
          <form onSubmit={gererSoumission}>

            {erreur && <div className="alerte-erreur">{erreur}</div>}

            {/* Rendu conditionnel des champs d'inscription */}
            {estInscription && (
              <div className="ligne-champs">
                <ChampTexte etiquette="Prénom" type="text" valeur={formulaire.prenom} modification={(val) => modifierChamp('prenom', val)} Icone={User} placeholder="Jean" />
                <ChampTexte etiquette="Nom" type="text" valeur={formulaire.nom} modification={(val) => modifierChamp('nom', val)} Icone={User} placeholder="Dupont" />
              </div>
            )}

            {/* Champs d'identification */}
            <ChampTexte etiquette="Email" type="email" valeur={formulaire.email} modification={(val) => modifierChamp('email', val)} Icone={Mail} placeholder="contact@email.com" />
            <ChampTexte etiquette="Mot de passe" type="password" valeur={formulaire.motDePasse} modification={(val) => modifierChamp('motDePasse', val)} Icone={Lock} placeholder="******" />

            <button type="submit" className="bouton-primaire">
              {estInscription ? <UserPlus size={20} /> : <LogIn size={20} />}
              {estInscription ? "S'inscrire" : "Se connecter"}
            </button>

            <div className="bascule-authentification">
              {estInscription ? "Déjà membre ?" : "Nouveau ?"}
              <span onClick={() => { setEstInscription(!estInscription); setErreur(''); }}>
                {estInscription ? "Connectez-vous" : "Créez votre compte"}
              </span>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
