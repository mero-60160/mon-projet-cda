import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    nbClients: 0,
    caGagne: 0,
    caAttente: 0,
    nbDevisActifs: 0,
    statutsData: [],
    moisData: []
  });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('crm_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const [respDevis, respClients] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/devis`, config),
          axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/clients`, config)
        ]);

        const clients = respClients.data;
        const devis = respDevis.data;

        const caGagne = devis.filter(d => d.statut === 'accepté').reduce((acc, curr) => acc + curr.totalHT, 0);
        const caAttente = devis.filter(d => d.statut === 'envoyé').reduce((acc, curr) => acc + curr.totalHT, 0);
        
        const statutsData = [
          { name: 'Brouillon', value: devis.filter(d => d.statut === 'brouillon').length, color: '#94a3b8' },
          { name: 'Envoyé', value: devis.filter(d => d.statut === 'envoyé').length, color: '#f59e0b' },
          { name: 'Accepté', value: devis.filter(d => d.statut === 'accepté').length, color: '#10b981' },
          { name: 'Refusé', value: devis.filter(d => d.statut === 'refusé').length, color: '#ef4444' },
        ].filter(d => d.value > 0);

        const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const moisData = Array(6).fill(0).map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - (5 - i));
          return { name: moisNoms[d.getMonth()], total: 0, moisIdx: d.getMonth(), annee: d.getFullYear() };
        });

        devis.filter(d => d.statut === 'accepté').forEach(d => {
          const dDate = new Date(d.dateEmission);
          const moisObj = moisData.find(m => m.moisIdx === dDate.getMonth() && m.annee === dDate.getFullYear());
          if (moisObj) moisObj.total += d.totalHT;
        });

        setStats({
          nbClients: clients.length,
          caGagne,
          caAttente,
          nbDevisActifs: devis.length,
          statutsData,
          moisData
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
      
      <div className="stats-grid">
        
        <div className="carte-premium" style={{ padding: '1.5rem' }}>
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

        <div className="carte-premium" style={{ padding: '1.5rem' }}>
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

        <div className="carte-premium" style={{ padding: '1.5rem' }}>
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

        <div className="carte-premium" style={{ padding: '1.5rem' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        <div className="carte-premium" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--texte-principal)' }}>Évolution du Chiffre d'Affaires (6 derniers mois)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={stats.moisData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `${val}€`} />
                <Tooltip cursor={{fill: '#f8fafc'}} formatter={(value) => [`${value.toFixed(2)} €`, 'CA HT']} labelStyle={{color: '#334155', fontWeight: 'bold'}} />
                <Bar dataKey="total" fill="var(--primaire)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="carte-premium" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--texte-principal)' }}>Répartition des Devis</h3>
          <div style={{ width: '100%', height: 300 }}>
            {stats.statutsData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={stats.statutsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.statutsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Devis']} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100%', color:'#94a3b8'}}>
                Aucune donnée de devis pour le moment.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
