import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Trash2, FileText, Download, X, PlusCircle, MinusCircle, Edit2, Send, CheckCircle, XCircle, Receipt } from 'lucide-react';

const CATALOGUE_PRODUITS = [
  // --- IT / Digital ---
  { nom: "Création Site Vitrine (WordPress)", prix: 1200 },
  { nom: "Site E-commerce complet (Shopify)", prix: 3500 },
  { nom: "Développement Application sur mesure", prix: 5000 },
  { nom: "Maintenance technique mensuelle", prix: 150 },
  { nom: "Audit de sécurité web", prix: 800 },
  
  // --- BTP / Maçonnerie / Gros Œuvre ---
  { nom: "Pose de mur en parpaings (le m²)", prix: 55.00 },
  { nom: "Sac de ciment 35kg", prix: 6.50 },
  { nom: "Sable à bâtir (la tonne)", prix: 35.00 },
  { nom: "Fondation béton armé (le m³)", prix: 150.00 },
  { nom: "Démolition de mur non porteur (forfait)", prix: 400.00 },
  { nom: "Évacuation des gravats (la tonne)", prix: 45.00 },

  // --- Plomberie / Chauffage ---
  { nom: "Recherche de fuite et réparation (forfait)", prix: 120.00 },
  { nom: "Fourniture et pose chauffe-eau 200L", prix: 850.00 },
  { nom: "Installation complète salle de bain", prix: 4500.00 },
  { nom: "Débouchage canalisation", prix: 90.00 },
  { nom: "Entretien annuel chaudière gaz", prix: 130.00 },

  // --- Électricité ---
  { nom: "Installation tableau électrique", prix: 950.00 },
  { nom: "Mise aux normes électriques (T3)", prix: 2500.00 },
  { nom: "Pose de prise de courant renforcée", prix: 180.00 },
  { nom: "Dépannage électrique urgence (forfait)", prix: 150.00 },

  // --- Menuiserie / Agencement ---
  { nom: "Pose fenêtre double vitrage PVC", prix: 650.00 },
  { nom: "Fabrication dressing sur mesure", prix: 1800.00 },
  { nom: "Pose de parquet flottant (le m²)", prix: 35.00 },
  { nom: "Fourniture et pose porte d'entrée", prix: 1200.00 },
  
  // --- Peinture / Revêtement ---
  { nom: "Préparation des murs (enduit + ponçage) (m²)", prix: 15.00 },
  { nom: "Peinture acrylique 2 couches (m²)", prix: 25.00 },
  { nom: "Pose de papier peint (le rouleau)", prix: 45.00 },

  // --- Services / Consulting ---
  { nom: "Coaching d'équipe (la journée)", prix: 800.00 },
  { nom: "Création Charte Graphique & Logo", prix: 800.00 },
  { nom: "Prestation de nettoyage locaux (mois)", prix: 300.00 },
  { nom: "Main d'œuvre générale (heure)", prix: 45.00 },
  { nom: "Consulting Stratégie Marketing (heure)", prix: 120.00 }
];

export default function Devis() {
  const [listeDevis, setListeDevis] = useState([]);
  const [clients, setClients] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  
  // Modal de création
  const [modalOuvert, setModalOuvert] = useState(false);
  const [formulaire, setFormulaire] = useState({
    clientId: '',
    numero: `DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    notes: '',
    tva: 20,
    lignes: [{ description: '', quantite: 1, prixUnitaire: 0 }]
  });
  const [devisEnEdition, setDevisEnEdition] = useState(null);

  const ouvrirModal = (devis = null) => {
    if (devis) {
      setDevisEnEdition(devis);
      setFormulaire({
        clientId: devis.clientId || '',
        numero: devis.numero,
        notes: devis.notes || '',
        tva: devis.tva !== undefined ? devis.tva : 20,
        lignes: devis.lignes && devis.lignes.length > 0 
          ? devis.lignes.map(l => ({ description: l.description, quantite: l.quantite, prixUnitaire: l.prixUnitaire }))
          : [{ description: '', quantite: 1, prixUnitaire: 0 }]
      });
    } else {
      setDevisEnEdition(null);
      setFormulaire({
        clientId: '',
        numero: `DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        notes: '',
        tva: 20,
        lignes: [{ description: '', quantite: 1, prixUnitaire: 0 }]
      });
    }
    setModalOuvert(true);
  };

  const chargerDonnees = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [respDevis, respClients] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/devis`, config),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/clients`, config)
      ]);
      
      setListeDevis(respDevis.data);
      setClients(respClients.data);
    } catch {
      setErreur("Impossible de charger les données depuis le serveur.");
    } finally {
      setChargement(false);
    }
  };

  const genererPDF = async (devis) => {
    try {
      const token = localStorage.getItem('crm_token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/devis/${devis.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' // Important pour télécharger le fichier
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `devis-${devis.numero}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch {
      alert("Erreur lors de la génération du devis PDF via le serveur.");
    }
  };

  const genererFacture = async (devis) => {
    if(!window.confirm("Voulez-vous transformer ce devis en facture officielle ? Cette action est irréversible.")) return;
    try {
      const token = localStorage.getItem('crm_token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/factures/depuis-devis`, 
        { devisId: devis.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Facture générée avec succès ! (Bientôt visible dans le menu Factures)");
      chargerDonnees();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la création de la facture.");
    }
  };

  const envoyerParEmail = async (devis) => {
    if(!window.confirm(`Voulez-vous envoyer ce devis par email à ${devis.client?.email || 'ce client'} ?`)) return;
    
    // UI Feedback
    const bouton = document.getElementById(`btn-mail-${devis.id}`);
    if (bouton) {
      bouton.style.opacity = '0.5';
      bouton.style.cursor = 'wait';
    }

    try {
      const token = localStorage.getItem('crm_token');
      const resp = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/devis/${devis.id}/send`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(`[DEV] Prévisualisation de l'email : ${resp.data.previewUrl}`);
      alert("Email envoyé avec succès !");
      chargerDonnees();
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de l'envoi de l'email.");
    } finally {
      if (bouton) {
        bouton.style.opacity = '1';
        bouton.style.cursor = 'pointer';
      }
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  const supprimerDevis = async (id) => {
    if(!window.confirm("Voulez-vous vraiment supprimer ce devis ?")) return;
    try {
      const token = localStorage.getItem('crm_token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/devis/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      chargerDonnees();
    } catch {
      alert("Erreur lors de la suppression.");
    }
  };

  const changerStatut = async (devis, nouveauStatut) => {
    try {
      const token = localStorage.getItem('crm_token');
      await axios.patch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/devis/${devis.id}/statut`, 
        { statut: nouveauStatut },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      chargerDonnees();
    } catch {
      alert("Erreur lors du changement de statut.");
    }
  };

  // --- GESTION DU FORMULAIRE DE CRÉATION ---
  const ajouterLigne = () => {
    setFormulaire({
      ...formulaire,
      lignes: [...formulaire.lignes, { description: '', quantite: 1, prixUnitaire: 0 }]
    });
  };

  const supprimerLigne = (index) => {
    const nouvellesLignes = formulaire.lignes.filter((_, i) => i !== index);
    setFormulaire({ ...formulaire, lignes: nouvellesLignes });
  };

  const modifierLigne = (index, champ, valeur) => {
    const nouvellesLignes = [...formulaire.lignes];
    nouvellesLignes[index][champ] = valeur;
    setFormulaire({ ...formulaire, lignes: nouvellesLignes });
  };

  const gererChangementDescription = (index, valeur) => {
    modifierLigne(index, 'description', valeur);
    // Auto-remplissage du prix si le produit existe dans le catalogue
    const produitTrouve = CATALOGUE_PRODUITS.find(p => p.nom === valeur);
    if (produitTrouve) {
      modifierLigne(index, 'prixUnitaire', produitTrouve.prix);
    }
  };

  const calculerTotalCreation = () => {
    const totalHT = formulaire.lignes.reduce((total, ligne) => total + (ligne.quantite * ligne.prixUnitaire), 0);
    const taux = parseFloat(formulaire.tva) || 0;
    return {
      ht: totalHT,
      tva: totalHT * (taux / 100),
      ttc: totalHT * (1 + taux / 100)
    };
  };

  const sauvegarderDevis = async (e) => {
    e.preventDefault();
    if (formulaire.lignes.length === 0) return alert("Il faut au moins une ligne !");
    
    const token = localStorage.getItem('crm_token');
    const payload = {
      ...formulaire,
      clientId: parseInt(formulaire.clientId)
    };
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (devisEnEdition) {
        await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/devis/${devisEnEdition.id}`, payload, config);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/devis`, payload, config);
      }
      setModalOuvert(false);
      chargerDonnees();
    } catch {
      alert("Erreur lors de la sauvegarde du devis.");
    }
  };

  const devisFiltres = listeDevis.filter(d => 
    d.numero.toLowerCase().includes(recherche.toLowerCase()) || 
    (d.client && `${d.client.nom} ${d.client.prenom} ${d.client.entreprise}`.toLowerCase().includes(recherche.toLowerCase()))
  );

  return (
    <div>
      <div className="entete-page">
        <div>
          <h1>Gestion des Devis</h1>
          <p>Créez, envoyez et suivez vos propositions commerciales.</p>
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
          <button className="bouton-primaire auto-largeur" onClick={() => ouvrirModal()}>
            <Plus size={18} /> Créer un Devis
          </button>
        </div>
      </div>

      {erreur && <div className="alerte-erreur">{erreur}</div>}

      <div className="table-conteneur">
        {chargement ? (
          <div className="etat-vide">Chargement des devis...</div>
        ) : devisFiltres.length === 0 ? (
          <div className="etat-vide">
            <FileText size={48} className="etat-vide-icone" />
            <h3>Aucun devis trouvé</h3>
            <p className="mt-2" style={{color: 'var(--texte-secondaire)'}}>Commencez par générer votre première proposition commerciale.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Client</th>
                <th>Date</th>
                <th>Montant TTC</th>
                <th>Statut</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {devisFiltres.map(devis => (
                <tr key={devis.id}>
                  <td style={{fontWeight: 600, color: 'var(--primaire)'}}>{devis.numero}</td>
                  <td>
                    {devis.client ? (
                      <>
                        <div style={{fontWeight: 500}}>{devis.client.entreprise || `${devis.client.prenom} ${devis.client.nom}`}</div>
                        {devis.client.entreprise && <div style={{fontSize: '0.8rem', color: 'var(--texte-secondaire)'}}>{devis.client.prenom} {devis.client.nom}</div>}
                      </>
                    ) : <span style={{color: 'var(--danger)'}}>Client supprimé</span>}
                  </td>
                  <td>{new Date(devis.dateEmission).toLocaleDateString()}</td>
                  <td style={{fontWeight: 600}}>{devis.totalTTC.toFixed(2)} €</td>
                  <td>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                      background: devis.statut === 'brouillon' ? '#F1F5F9' : devis.statut === 'envoyé' ? '#FEF08A' : devis.statut === 'accepté' ? '#DCFCE7' : '#FEE2E2',
                      color: devis.statut === 'brouillon' ? 'var(--texte-secondaire)' : devis.statut === 'envoyé' ? '#854D0E' : devis.statut === 'accepté' ? '#166534' : '#991B1B'
                    }}>
                      {devis.statut.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions" style={{justifyContent: 'flex-end'}}>
                      {devis.statut === 'brouillon' && (
                        <button className="bouton-icone" onClick={() => changerStatut(devis, 'envoyé')} title="Marquer comme Envoyé">
                          <Send size={18} color="#CA8A04" />
                        </button>
                      )}
                      
                      {devis.statut === 'envoyé' && (
                        <>
                          <button className="bouton-icone" onClick={() => changerStatut(devis, 'accepté')} title="Marquer comme Accepté">
                            <CheckCircle size={18} color="#16a34a" />
                          </button>
                          <button className="bouton-icone" onClick={() => changerStatut(devis, 'refusé')} title="Marquer comme Refusé">
                            <XCircle size={18} color="#dc2626" />
                          </button>
                        </>
                      )}
                      
                      {devis.statut === 'accepté' && (
                        <button className="bouton-icone" onClick={() => genererFacture(devis)} title="Générer la facture">
                          <Receipt size={18} color="#2563eb" />
                        </button>
                      )}

                      {devis.statut === 'brouillon' && (
                        <button className="bouton-icone" onClick={() => ouvrirModal(devis)} title="Modifier le devis">
                          <Edit2 size={18} />
                        </button>
                      )}
                      
                      <button id={`btn-mail-${devis.id}`} className="bouton-icone" onClick={() => envoyerParEmail(devis)} title="Envoyer par email" style={{color: '#8b5cf6'}}>
                        <Send size={18} />
                      </button>

                      <button className="bouton-icone" onClick={() => genererPDF(devis)} title="Télécharger en PDF">
                        <Download size={18} />
                      </button>
                      <button className="bouton-icone danger" onClick={() => supprimerDevis(devis.id)} title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOuvert && (
        <div className="modal-overlay">
          <div className="modal-contenu" style={{maxWidth: '800px', width: '90%'}}>
            <div className="modal-entete">
               <h2>{devisEnEdition ? "Modifier la proposition commerciale" : "Créer une nouvelle proposition commerciale"}</h2>
               <button type="button" className="modal-fermer" onClick={() => setModalOuvert(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={sauvegarderDevis}>
              <div className="modal-corps" style={{maxHeight: '60vh', overflowY: 'auto'}}>
                
                <div className="ligne-champs" style={{marginBottom: '1.5rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px'}}>
                  <div className="formulaire-groupe">
                    <label className="formulaire-etiquette">Numéro de Devis</label>
                    <input type="text" className="formulaire-champ sans-icone" value={formulaire.numero} onChange={(e) => setFormulaire({...formulaire, numero: e.target.value})} required/>
                  </div>
                  
                  <div className="formulaire-groupe">
                    <label className="formulaire-etiquette">Selectionner un Client *</label>
                    <select className="formulaire-champ sans-icone" value={formulaire.clientId} onChange={(e) => setFormulaire({...formulaire, clientId: e.target.value})} required style={{backgroundColor: 'white'}}>
                      <option value="">-- Choisir --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.entreprise ? `${c.entreprise} (${c.prenom} ${c.nom})` : `${c.prenom} ${c.nom}`}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="formulaire-groupe">
                    <label className="formulaire-etiquette">Taux de TVA (%)</label>
                    <select className="formulaire-champ sans-icone" value={formulaire.tva} onChange={(e) => setFormulaire({...formulaire, tva: parseFloat(e.target.value)})} required style={{backgroundColor: 'white'}}>
                      <option value="20">20% (Standard)</option>
                      <option value="10">10% (Intermédiaire)</option>
                      <option value="5.5">5.5% (Réduit)</option>
                      <option value="0">0% (Auto-entrepreneur / Exonéré)</option>
                    </select>
                  </div>
                </div>

                <h3 style={{fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between'}}>
                  Lignes du devis
                  <button type="button" onClick={ajouterLigne} style={{display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: 'var(--primaire)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600}}>
                    <PlusCircle size={16}/> Ajouter Ligne
                  </button>
                </h3>
                
                {formulaire.lignes.map((ligne, i) => (
                  <div key={i} style={{display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--bordure)'}}>
                    <div className="formulaire-groupe" style={{flex: 3, marginBottom: 0}}>
                      {i === 0 && <label className="formulaire-etiquette">Description *</label>}
                      <input 
                        type="text" 
                        list="catalogue-produits"
                        className="formulaire-champ sans-icone" 
                        value={ligne.description} 
                        onChange={(e) => gererChangementDescription(i, e.target.value)} 
                        required 
                        placeholder="Choisissez ou tapez un nom de produit..."
                      />
                    </div>
                    
                    <div className="formulaire-groupe" style={{flex: 1, marginBottom: 0}}>
                      {i === 0 && <label className="formulaire-etiquette">Qté *</label>}
                      <input type="number" step="0.01" min="0" className="formulaire-champ sans-icone" value={ligne.quantite} onChange={(e) => modifierLigne(i, 'quantite', parseFloat(e.target.value))} required/>
                    </div>
                    
                    <div className="formulaire-groupe" style={{flex: 1.5, marginBottom: 0}}>
                      {i === 0 && <label className="formulaire-etiquette">Prix U. HT (€) *</label>}
                      <input type="number" step="0.01" min="0" className="formulaire-champ sans-icone" value={ligne.prixUnitaire} onChange={(e) => modifierLigne(i, 'prixUnitaire', parseFloat(e.target.value))} required/>
                    </div>

                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                       {i === 0 && <label className="formulaire-etiquette">Total HT</label>}
                       <div style={{fontWeight: 600, padding: '0.75rem 0'}}>{(ligne.quantite * ligne.prixUnitaire).toFixed(2)} €</div>
                    </div>
                    
                    <button type="button" onClick={() => supprimerLigne(i)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', marginTop: i === 0 ? '2rem' : '0.8rem', padding: '0.5rem'}} disabled={formulaire.lignes.length === 1}>
                      <MinusCircle size={20}/>
                    </button>
                  </div>
                ))}
                
                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '1rem'}}>
                  <div style={{background: '#F8FAFC', padding: '1rem', borderRadius: '8px', minWidth: '250px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                      <span style={{color: 'var(--texte-secondaire)'}}>Sous-total HT</span>
                      <strong>{calculerTotalCreation().ht.toFixed(2)} €</strong>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                      <span style={{color: 'var(--texte-secondaire)'}}>TVA ({formulaire.tva}%)</span>
                      <strong>{calculerTotalCreation().tva.toFixed(2)} €</strong>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--bordure)', paddingTop: '0.5rem', fontSize: '1.2rem', color: 'var(--primaire)'}}>
                      <span><strong>Total TTC</strong></span>
                      <strong>{calculerTotalCreation().ttc.toFixed(2)} €</strong>
                    </div>
                  </div>
                </div>

              </div>

              <div className="modal-pied">
                 <button type="button" className="bouton-secondaire" onClick={() => setModalOuvert(false)}>Annuler</button>
                 <button type="submit" className="bouton-primaire auto-largeur">{devisEnEdition ? "Mettre à jour" : "Enregistrer le Devis"}</button>
              </div>
            </form>
            
            <datalist id="catalogue-produits">
              {CATALOGUE_PRODUITS.map((p, idx) => (
                <option key={idx} value={p.nom} />
              ))}
            </datalist>

          </div>
        </div>
      )}
    </div>
  );
}
