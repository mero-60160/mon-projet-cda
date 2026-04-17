import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit2, Trash2, Mail, Phone, Users, X } from 'lucide-react';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  
  // Modal
  const [modalOuvert, setModalOuvert] = useState(false);
  const [clientEnEdition, setClientEnEdition] = useState(null);
  const [formulaire, setFormulaire] = useState({ nom: '', prenom: '', email: '', telephone: '', entreprise: '', adresse: '' });

  const chargerClients = async () => {
    try {
      const token = localStorage.getItem('crm_token');
      const rep = await axios.get('http://localhost:3000/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(rep.data);
    } catch (err) {
      setErreur("Impossible de charger les clients depuis le serveur.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    chargerClients();
  }, []);

  const modifierChamp = (champ, valeur) => setFormulaire({ ...formulaire, [champ]: valeur });

  const ouvrirModal = (client = null) => {
    if (client) {
      setClientEnEdition(client);
      setFormulaire({ ...client });
    } else {
      setClientEnEdition(null);
      setFormulaire({ nom: '', prenom: '', email: '', telephone: '', entreprise: '', adresse: '' });
    }
    setModalOuvert(true);
  };

  const sauvegarderClient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('crm_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    try {
      if (clientEnEdition) {
        await axios.put(`http://localhost:3000/api/clients/${clientEnEdition.id}`, formulaire, config);
      } else {
        await axios.post('http://localhost:3000/api/clients', formulaire, config);
      }
      setModalOuvert(false);
      chargerClients();
    } catch (err) {
      alert("Erreur lors de la sauvegarde du client.");
    }
  };

  const supprimerClient = async (id) => {
    if(!window.confirm("Voulez-vous vraiment supprimer ce client de votre carnet ?")) return;
    try {
      const token = localStorage.getItem('crm_token');
      await axios.delete(`http://localhost:3000/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      chargerClients();
    } catch (err) {
      alert("Erreur lors de la suppression.");
    }
  };

  // Filtrage simple sur Nom/Prénom/Entreprise
  const clientsFiltres = clients.filter(c => 
    `${c.nom} ${c.prenom} ${c.entreprise}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div>
      {/* En-tête de la page */}
      <div className="entete-page">
        <div>
          <h1>Gestion des Clients</h1>
          <p>Voici la liste de vos contacts et entreprises partenaires.</p>
        </div>
        <div className="actions-page">
          <div className="champ-avec-icone champ-recherche">
            <Search className="icone-champ" size={18} />
            <input 
              type="text" 
              className="formulaire-champ" 
              placeholder="Rechercher un client..." 
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
          <button className="bouton-primaire auto-largeur" onClick={() => ouvrirModal()}>
            <Plus size={18} /> Nouveau Client
          </button>
        </div>
      </div>

      {erreur && <div className="alerte-erreur">{erreur}</div>}

      {/* Tableau des données */}
      <div className="table-conteneur">
        {chargement ? (
          <div className="etat-vide">Chargement des données...</div>
        ) : clientsFiltres.length === 0 ? (
          <div className="etat-vide">
            <Users size={48} className="etat-vide-icone" />
            <h3>Aucun client trouvé</h3>
            <p className="mt-2" style={{color: 'var(--texte-secondaire)'}}>Ajoutez votre premier client pour commencer à organiser votre carnet d'adresses.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Contact</th>
                <th>Entreprise</th>
                <th>Coordonnées</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clientsFiltres.map(client => (
                <tr key={client.id}>
                  <td>
                    <strong>{client.prenom} {client.nom}</strong>
                  </td>
                  <td>{client.entreprise || <span style={{color: '#CBD5E1'}}>-</span>}</td>
                  <td>
                    {client.email && <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem'}}><Mail size={14} color="#94A3B8"/> {client.email}</div>}
                    {client.telephone && <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginTop: '6px'}}><Phone size={14} color="#94A3B8"/> {client.telephone}</div>}
                    {!client.email && !client.telephone && <span style={{color: '#CBD5E1'}}>-</span>}
                  </td>
                  <td>
                    <div className="table-actions" style={{justifyContent: 'flex-end'}}>
                      <button className="bouton-icone" onClick={() => ouvrirModal(client)} title="Modifier la fiche">
                        <Edit2 size={18} />
                      </button>
                      <button className="bouton-icone danger" onClick={() => supprimerClient(client.id)} title="Supprimer le client">
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

      {/* ------------ MODAL AJOUT/EDITION CLIENT ------------ */}
      {modalOuvert && (
        <div className="modal-overlay">
          <div className="modal-contenu">
            <div className="modal-entete">
               <h2>{clientEnEdition ? "Modifier le client" : "Nouveau client"}</h2>
               <button type="button" className="modal-fermer" onClick={() => setModalOuvert(false)}><X size={20}/></button>
            </div>
            
            <form onSubmit={sauvegarderClient}>
              <div className="modal-corps">
                <div className="ligne-champs">
                  <div className="formulaire-groupe">
                    <label className="formulaire-etiquette">Prénom *</label>
                    <input type="text" className="formulaire-champ sans-icone" value={formulaire.prenom} onChange={(e) => modifierChamp('prenom', e.target.value)} required placeholder="Ex: Jean"/>
                  </div>
                  <div className="formulaire-groupe">
                    <label className="formulaire-etiquette">Nom *</label>
                    <input type="text" className="formulaire-champ sans-icone" value={formulaire.nom} onChange={(e) => modifierChamp('nom', e.target.value)} required placeholder="Ex: Dupont"/>
                  </div>
                </div>

                <div className="formulaire-groupe">
                  <label className="formulaire-etiquette">Entreprise (Optionnel)</label>
                  <input type="text" className="formulaire-champ sans-icone" value={formulaire.entreprise || ''} onChange={(e) => modifierChamp('entreprise', e.target.value)} placeholder="Nom de la société..." />
                </div>

                <div className="ligne-champs">
                  <div className="formulaire-groupe">
                    <label className="formulaire-etiquette">Email</label>
                    <input type="email" className="formulaire-champ sans-icone" value={formulaire.email || ''} onChange={(e) => modifierChamp('email', e.target.value)} placeholder="contact@email.com" />
                  </div>
                  <div className="formulaire-groupe">
                    <label className="formulaire-etiquette">Téléphone</label>
                    <input type="text" className="formulaire-champ sans-icone" value={formulaire.telephone || ''} onChange={(e) => modifierChamp('telephone', e.target.value)} placeholder="06 12 34..." />
                  </div>
                </div>

                <div className="formulaire-groupe" style={{marginBottom: 0}}>
                  <label className="formulaire-etiquette">Adresse Postale</label>
                  <textarea className="formulaire-champ sans-icone" rows="3" value={formulaire.adresse || ''} onChange={(e) => modifierChamp('adresse', e.target.value)} placeholder="Adresse complète..."></textarea>
                </div>
              </div>

              <div className="modal-pied">
                 <button type="button" className="bouton-secondaire" onClick={() => setModalOuvert(false)}>Annuler</button>
                 <button type="submit" className="bouton-primaire auto-largeur">{clientEnEdition ? "Enregistrer" : "Créer le client"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
