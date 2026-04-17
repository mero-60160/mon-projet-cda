import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Authentification from './pages/Authentification';
import Layout from './composants/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import './App.css';

function App() {
  const [estConnecte, setEstConnecte] = useState(false);
  
  // Vérification de session
  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    if (token) setEstConnecte(true);
  }, []);

  const gererDeconnexion = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    setEstConnecte(false);
  };

  // Si pas connecté, affiche le module d'auth
  if (!estConnecte) {
    return <Authentification onLoginSuccess={() => setEstConnecte(true)} />;
  }

  // Application une fois connectée avec Système de Routage
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout onLogout={gererDeconnexion} />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          {/* <Route path="devis" element={<Devis />} /> Plus tard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
