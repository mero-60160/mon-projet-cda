import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <div className="entete-page">
        <div>
          <h1>Aperçu de votre activité</h1>
          <p>Bienvenue sur votre espace de pilotage.</p>
        </div>
      </div>
      
      <div className="table-conteneur" style={{ padding: '3rem', textAlign: 'center', color: 'var(--texte-secondaire)' }}>
        <h2>Phase 4 - Bientôt disponible</h2>
        <p style={{ marginTop: '1rem'}}>
          C'est ici que viendront vos graphiques (Chiffre d'Affaires) et statistiques globales du Mini CRM.
        </p>
      </div>
    </div>
  );
}
