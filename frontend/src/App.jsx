import { useState, useEffect } from 'react';
import Authentification from './pages/Authentification';
import './App.css';

/**
 * Composant Racine de l'application
 * Gère le cycle de vie de la session (Connexion / Déconnexion)
 */
function App() {
  const [estConnecte, setEstConnecte] = useState(false);
  
  // Utilisation d'un effet secondaire pour vérifier la persistance de session
  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (token) {
      setEstConnecte(true);
    }
  }, []);

  /**
   * Gestionnaire de fin de session
   * Nettoie le stockage local et réinitialise l'état d'authentification
   */
  const gererDeconnexion = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setEstConnecte(false);
  };

  // Affichage du module d'authentification si la session est expirée ou inexistante
  if (!estConnecte) {
    return <Authentification onLoginSuccess={() => setEstConnecte(true)} />;
  }

  // Affichage du tableau de bord une fois la session validée
  return (
    <div style={{ padding: '2rem' }}>
      <h1>🎉 Bienvenue dans le Mini CRM</h1>
      <p>L'interface du tableau de bord global.</p>
      
      <button 
        onClick={gererDeconnexion} 
        style={{ 
          marginTop: '2rem', 
          background: 'var(--danger)', 
          color: 'white', 
          border: 'none', 
          padding: '10px 20px', 
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'var(--police-texte)'
        }}>
        Terminer la session
      </button>
    </div>
  );
}

export default App;
