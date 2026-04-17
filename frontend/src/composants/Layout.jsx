import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, LogOut, Briefcase } from 'lucide-react';

export default function Layout({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('crm_user') || '{"nom": "User", "prenom": ""}');

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Tableau de bord';
      case '/clients': return 'Gestion des clients';
      case '/devis': return 'Gestion des devis';
      default: return 'CRM';
    }
  };

  return (
    <div className="layout-app">
      {/* Barre latérale */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Briefcase size={28} />
          <h2>M-Atici</h2>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/" className={({ isActive }) => isActive ? "menu-item actif" : "menu-item"} end>
            <LayoutDashboard size={20} />
            Tableau de bord
          </NavLink>

          <NavLink to="/clients" className={({ isActive }) => isActive ? "menu-item actif" : "menu-item"}>
            <Users size={20} />
            Clients
          </NavLink>

          <NavLink to="/devis" className={({ isActive }) => isActive ? "menu-item actif" : "menu-item"}>
            <FileText size={20} />
            Devis & Factures
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="bouton-secondaire" style={{ width: 'auto', border: 'none', color: 'var(--danger)' }} onClick={handleLogout}>
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="contenu-principal">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-titre">
            {getPageTitle()}
          </div>

          <div className="profil-utilisateur">
            <span>{userData.prenom} {userData.nom}</span>
            <div className="avatar">
              {userData.prenom.charAt(0)}{userData.nom.charAt(0)}
            </div>
          </div>
        </header>

        {/* Espace qui chargera les pages correspondantes au Router */}
        <div className="page-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
