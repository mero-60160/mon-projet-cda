import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    nbClients: 0,
    caGagne: 0,
    caAttente: 0,
    nbDevisActifs: 0
  });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('crm_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [respDevis, respClients] = await Promise.all([
          axios.get('http://localhost:3000/api/devis', config),
          axios.get('http://localhost:3000/api/clients', config)
        ]);

        const clients = respClients.data;
        const devis = respDevis.data;

        // Calculs dynamiques
        const caGagne = devis.filter(d => d.statut === 'accepté').reduce((acc, curr) => acc + curr.totalHT, 0);
        const caAttente = devis.filter(d => d.statut === 'envoyé').reduce((acc, curr) => acc + curr.totalHT, 0);
        
        setStats({
          nbClients: clients.length,
          caGagne,
          caAttente,
          nbDevisActifs: devis.length
        });
      } catch (error) {
        console.error("Erreur chargement dashboard", error);
      } finally {
        setChargement(false);
      }
    };
    fetchData();
  }, []);

  if (chargement) return <div style={{padding: '2rem'}}>Chargement de votre espace de pilotage...</div>;

  return (
    <div>
      <div className="entete-page">
        <div>
          <h1>Aperçu de votre activité</h1>
          <p>Bienvenue sur votre espace de pilotage. Vos données sont calculées en temps réel.</p>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <div className="carte-premium" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primaire)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--texte-secondaire)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Clients Totaux</p>
              <h2 style={{ fontSize: '2rem' }}>{stats.nbClients}</h2>
            </div>
            <div style={{ padding: '1rem', background: '#EFF6FF', borderRadius: '12px', color: 'var(--primaire)' }}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="carte-premium" style={{ padding: '1.5rem', borderLeft: '4px solid var(--succes)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--texte-secondaire)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Chiffre d'Affaires Généré (HT)</p>
              <h2 style={{ fontSize: '2rem', color: 'var(--succes)' }}>{stats.caGagne.toFixed(2)} €</h2>
            </div>
            <div style={{ padding: '1rem', background: '#ECFDF5', borderRadius: '12px', color: 'var(--succes)' }}>
              <CheckCircle size={24} />
            </div>
          </div>
        </div>

        <div className="carte-premium" style={{ padding: '1.5rem', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--texte-secondaire)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Devis en Attente (HT)</p>
              <h2 style={{ fontSize: '2rem', color: '#F59E0B' }}>{stats.caAttente.toFixed(2)} €</h2>
            </div>
            <div style={{ padding: '1rem', background: '#FEF3C7', borderRadius: '12px', color: '#F59E0B' }}>
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="carte-premium" style={{ padding: '1.5rem', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--texte-secondaire)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Devis Créés</p>
              <h2 style={{ fontSize: '2rem', color: '#8B5CF6' }}>{stats.nbDevisActifs}</h2>
            </div>
            <div style={{ padding: '1rem', background: '#F5F3FF', borderRadius: '12px', color: '#8B5CF6' }}>
              <FileText size={24} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
