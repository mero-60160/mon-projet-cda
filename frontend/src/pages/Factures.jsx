import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, CheckCircle, XCircle, FileText } from 'lucide-react';

export default function Factures() {
  const [listeFactures, setListeFactures] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const chargerDonnees = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/factures`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListeFactures(response.data);
    } catch {
      setErreur("Impossible de charger les factures depuis le serveur.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const changerStatut = async (facture, nouveauStatut) => {
    try {
      const token = localStorage.getItem('crm_token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/factures/${facture.id}/statut`, 
        { statut: nouveauStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      chargerDonnees();
    } catch {
      alert("Erreur lors du changement de statut.");
    }
  };

  const genererPDF = async (facture) => {
    try {
      const token = localStorage.getItem('crm_token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/factures/${facture.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${facture.numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      alert("Erreur lors de la génération du PDF. La route n'est peut-être pas encore implémentée côté serveur.");
    }
  };

  const facturesFiltrees = listeFactures.filter(f => 
    f.numero.toLowerCase().includes(recherche.toLowerCase()) || 
    (f.client && `${f.client.nom} ${f.client.prenom} ${f.client.entreprise}`.toLowerCase().includes(recherche.toLowerCase()))
  );

  return (
    <div>
      <div className="entete-page">
        <div>
          <h1>Gestion des Factures</h1>
          <p>Consultez vos factures et suivez leurs paiements.</p>
        </div>
        <div className="actions-page">
          <div className="champ-avec-icone champ-recherche">
            <Search className="icone-champ" size={18} />
            <input 
              type="text" 
              className="formulaire-champ" 
              placeholder="Rechercher par numéro ou client..." 
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
        </div>
      </div>

      {erreur && <div className="alerte-erreur">{erreur}</div>}

      <div className="table-conteneur">
        {chargement ? (
          <div className="etat-vide">Chargement des factures...</div>
        ) : facturesFiltrees.length === 0 ? (
          <div className="etat-vide">
            <FileText size={48} className="etat-vide-icone" />
            <h3>Aucune facture trouvée</h3>
            <p className="mt-2" style={{color: 'var(--texte-secondaire)'}}>Transformez un devis accepté en facture pour la voir apparaître ici.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Date Création</th>
                <th>Échéance</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facturesFiltrees.map(facture => (
                <tr key={facture.id}>
                  <td style={{fontWeight: 600, color: 'var(--primaire)'}}>{facture.numero}</td>
                  <td>
                    {facture.client ? (
                      <>
                        <div style={{fontWeight: 500}}>{facture.client.entreprise || `${facture.client.prenom} ${facture.client.nom}`}</div>
                      </>
                    ) : <span style={{color: 'var(--danger)'}}>Client introuvable</span>}
                  </td>
                  <td>{new Date(facture.createdAt).toLocaleDateString()}</td>
                  <td style={{color: new Date(facture.dateEcheance) < new Date() && facture.statut !== 'payée' ? 'var(--danger)' : 'inherit'}}>
                    {new Date(facture.dateEcheance).toLocaleDateString()}
                  </td>
                  <td style={{fontWeight: 600}}>{facture.totalTTC.toFixed(2)} €</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                      background: facture.statut === 'en_attente' ? '#FEF08A' : facture.statut === 'payée' ? '#DCFCE7' : '#FEE2E2',
                      color: facture.statut === 'en_attente' ? '#854D0E' : facture.statut === 'payée' ? '#166534' : '#991B1B'
                    }}>
                      {facture.statut.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions" style={{justifyContent: 'flex-end'}}>
                      {facture.statut === 'en_attente' && (
                        <>
                          <button className="bouton-icone" onClick={() => changerStatut(facture, 'payée')} title="Marquer comme Payée">
                            <CheckCircle size={18} color="#16a34a" />
                          </button>
                          <button className="bouton-icone" onClick={() => changerStatut(facture, 'annulée')} title="Annuler la facture">
                            <XCircle size={18} color="#dc2626" />
                          </button>
                        </>
                      )}
                      
                      <button className="bouton-icone" onClick={() => genererPDF(facture)} title="Télécharger en PDF">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
