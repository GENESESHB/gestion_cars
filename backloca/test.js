Nice, this file is already rich, we just need to **clean it a bit and align it with a clear backend structure**.
I’ll do 2 things for you:

1. 🔧 Give you a **more organized version of `SmartContra.js`** that sends clean JSON to the backend.
2. 🧱 Give you **backend MERN code**: Mongoose model + Express routes (`Contrasmart`) that work with your existing `User`, `SmartCar`, `Blacklist`, etc.

---

## 1️⃣ Frontend – Organized `SmartContra.js` (clean + ready for backend)

Changes I made:

* Extracted `initialFormData` constant.
* Simplified `loadSmartContracts` to a **single clear response shape**: `res.data.contrasmarts`.
* On submit, the payload is clean and matches the backend schema.
* Kept all your features (print, edit, delete, damages, conducteur, taxes, etc.).

```js
// src/components/SmartContra/SmartContra.js
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../utils/api';
import './SmartContra.css';

// ---------- CONSTANTS ----------
const vehicleParts = [
  'Pare-chocs Avant',
  'Pare-chocs Arrière',
  'Porte Avant Gauche',
  'Porte Avant Droite',
  'Porte Arrière Gauche',
  'Porte Arrière Droite',
  'Aile Avant Gauche',
  'Aile Avant Droite',
  'Aile Arrière Gauche',
  'Aile Arrière Droite',
  'Capot',
  'Coffre',
  'Toit',
  'Rétroviseur Gauche',
  'Rétroviseur Droit',
  'Phare Avant Gauche',
  'Phare Avant Droit',
  'Feu Arrière Gauche',
  'Feu Arrière Droit',
  'Vitre Avant',
  'Vitre Arrière',
  'Jante Avant Gauche',
  'Jante Avant Droite',
  'Jante Arrière Gauche',
  'Jante Arrière Droite',
];

const initialFormData = {
  clientId: '',
  vehicleId: '',
  smartCarId: '',
  startDate: '',
  endDate: '',
  startLocation: '',
  endLocation: '',
  prixVoiture: '',
  prixTotal: '',
  niveauReservoir: '',
  assurance: {
    compagnie: '',
    numero: '',
    dateDebut: '',
    dateFin: '',
  },
  impot: {
    tva: '',
    taxeSejour: '',
    autresTaxes: '',
  },
  dommages: [],
  methodPaiement: 'espece',
  cardInfo: {
    numero: '',
    nom: '',
    expiration: '',
    cvv: '',
  },
  chequeInfo: {
    numero: '',
    banque: '',
    dateEmission: '',
  },
  conducteur: {
    nom: '',
    prenom: '',
    cin: '',
    permis: '',
    dateNaissance: '',
    telephone: '',
  },
  status: 'pending',
  notes: '',
  contractNumber: '',
};

// ---------- HELPERS ----------
const calculateDays = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate - startDate);
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days || 1;
};

const generateContractNumber = () => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return `SMART-${timestamp}-${random}`;
};

// ---------- COMPONENT ----------
const SmartContra = ({ user, clients = [], smartCars = [], setMessage }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [availableSmartCars, setAvailableSmartCars] = useState([]);
  const [smartContracts, setSmartContracts] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [selectedParts, setSelectedParts] = useState([]);

  // ---- LOAD SMART CARS & CONTRACTS ----
  const loadSmartContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contrasmart'); // or '/api/contrasmart'
      const contracts = res.data?.contrasmarts || [];
      setSmartContracts(contracts);
    } catch (err) {
      console.error('❌ Erreur loading smart contracts:', err);
      setSmartContracts([]);
      setMessage('❌ Erreur lors du chargement des contrats intelligents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSmartCars = async () => {
      try {
        const res = await api.get('/smart-cars'); // or '/api/smart-cars'
        const cars =
          res.data?.smartCars ||
          res.data?.cars ||
          (Array.isArray(res.data) ? res.data : []);
        setAvailableSmartCars(cars);
      } catch (err) {
        console.error('❌ Erreur loading smart cars:', err);
        setAvailableSmartCars([]);
      }
    };

    loadSmartCars();
    loadSmartContracts();
  }, []);

  // ---- PRICE CALCULATION ----
  const calculateTotalPrice = () => {
    const days = calculateDays(formData.startDate, formData.endDate);
    const basePrice = parseFloat(formData.prixVoiture) || 0;
    const dailyPrice = basePrice * days;

    const tva = parseFloat(formData.impot?.tva) || 0;
    const taxeSejour = parseFloat(formData.impot?.taxeSejour) || 0;
    const autresTaxes = parseFloat(formData.impot?.autresTaxes) || 0;

    return dailyPrice + tva + taxeSejour + autresTaxes;
  };

  useEffect(() => {
    const total = calculateTotalPrice();
    setFormData((prev) => ({
      ...prev,
      prixTotal: total.toFixed(2),
    }));
  }, [
    formData.prixVoiture,
    formData.startDate,
    formData.endDate,
    formData.impot?.tva,
    formData.impot?.taxeSejour,
    formData.impot?.autresTaxes,
  ]);

  // ---- FORM HANDLERS ----
  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedParts([]);
    setEditingContract(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleConducteurChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      conducteur: {
        ...prev.conducteur,
        [field]: value,
      },
    }));
  };

  const handleVehicleChange = (vehicleId) => {
    if (vehicleId) {
      const selectedVehicle = availableSmartCars.find((v) => v._id === vehicleId);
      if (selectedVehicle) {
        setFormData((prev) => ({
          ...prev,
          vehicleId: vehicleId,
          smartCarId: vehicleId,
          prixVoiture: selectedVehicle.prixJour || selectedVehicle.prixPerDay || '0',
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        vehicleId: '',
        smartCarId: '',
        prixVoiture: '',
      }));
    }
  };

  const handlePartSelection = (part) => {
    setSelectedParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part]
    );
  };

  const addSelectedDamages = () => {
    if (selectedParts.length === 0) return;

    const newDamages = selectedParts.map((part) => ({
      id: Date.now().toString() + Math.random(),
      emplacement: part,
      description: `Dommage sur ${part}`,
      type: 'leger',
      date: new Date().toISOString().split('T')[0],
    }));

    setFormData((prev) => ({
      ...prev,
      dommages: [...(prev.dommages || []), ...newDamages],
    }));
    setSelectedParts([]);
  };

  const removeDommage = (id) => {
    setFormData((prev) => ({
      ...prev,
      dommages: (prev.dommages || []).filter((d) => d.id !== id),
    }));
  };

  const getAvailableSmartCars = () =>
    Array.isArray(availableSmartCars)
      ? availableSmartCars.filter(
          (car) => car.status !== 'maintenance' && car.status !== 'indisponible'
        )
      : [];

  // ---- SUBMIT ----
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedVehicle = availableSmartCars.find(
        (v) => v._id === formData.vehicleId
      );
      const selectedClient = (clients || []).find(
        (c) => c._id === formData.clientId
      );

      const days = calculateDays(formData.startDate, formData.endDate);

      const payload = {
        ...formData,
        contractNumber: editingContract
          ? formData.contractNumber
          : generateContractNumber(),
        prixTotal: calculateTotalPrice(),
        days,
        createdBy: user?._id,
        entreprise: user?.entreprise || '',
        // IDs (for relations)
        clientId: formData.clientId,
        vehicleId: formData.vehicleId,
        smartCarId: formData.smartCarId || formData.vehicleId,
        // Optional denormalized info (for print + display)
        clientInfo: selectedClient
          ? {
              _id: selectedClient._id,
              firstName: selectedClient.firstName,
              lastName: selectedClient.lastName,
              cin: selectedClient.cin,
              phone: selectedClient.phone,
              email: selectedClient.email,
            }
          : null,
        vehicleInfo: selectedVehicle
          ? {
            _id: selectedVehicle._id,
            nomVehicule: selectedVehicle.nomVehicule,
            numeroMatricule: selectedVehicle.numeroMatricule,
            typeVehicule: selectedVehicle.typeVehicule,
            boiteVitesse: selectedVehicle.boiteVitesse,
            typeCarburant: selectedVehicle.typeCarburant,
            imageVehicule: selectedVehicle.imageVehicule,
          }
          : null,
      };

      console.log('📤 SENDING TO BACKEND:', payload);

      if (editingContract) {
        await api.put(`/contrasmart/${editingContract._id}`, payload);
        setMessage('✅ Contrat intelligent mis à jour avec succès');
      } else {
        await api.post('/contrasmart', payload);
        setMessage('✅ Contrat intelligent créé avec succès');
      }

      await loadSmartContracts();
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('❌ Erreur:', err);
      setMessage('❌ Erreur lors de la sauvegarde du contrat intelligent');
    } finally {
      setLoading(false);
    }
  };

  // ---- EDIT / DELETE ----
  const handleEdit = (contract) => {
    if (!contract) return;

    setEditingContract(contract);

    setFormData({
      ...initialFormData,
      ...contract,
      clientId: contract.clientId || contract.clientInfo?._id || '',
      vehicleId: contract.vehicleId || contract.vehicleInfo?._id || '',
      smartCarId: contract.smartCarId || contract.vehicleInfo?._id || '',
      assurance: contract.assurance || initialFormData.assurance,
      impot: contract.impot || initialFormData.impot,
      cardInfo: contract.cardInfo || initialFormData.cardInfo,
      chequeInfo: contract.chequeInfo || initialFormData.chequeInfo,
      conducteur: contract.conducteur || initialFormData.conducteur,
      contractNumber: contract.contractNumber || '',
    });

    if (contract.dommages && contract.dommages.length > 0) {
      setSelectedParts(contract.dommages.map((d) => d.emplacement));
    } else {
      setSelectedParts([]);
    }

    setShowForm(true);
  };

  const handleDelete = async (contractId) => {
    if (!contractId) return;
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat intelligent ?'))
      return;

    try {
      await api.delete(`/contrasmart/${contractId}`);
      setMessage('✅ Contrat intelligent supprimé avec succès');
      await loadSmartContracts();
    } catch (err) {
      console.error('❌ Erreur:', err);
      setMessage('❌ Erreur lors de la suppression du contrat intelligent');
    }
  };

  // ---- PRINT / DOWNLOAD ----
  const handlePrint = (contract) => {
    if (!contract) return;
    const printWindow = window.open('', '_blank');
    const days = calculateDays(contract.startDate, contract.endDate);

    // (I keep your print template exactly the same here)
    // ... you can paste your existing printContent here unchanged ...

    // For brevity, not repeating the full HTML; reuse your previous printContent.
  };

  const handleDownload = (contract) => {
    handlePrint(contract);
  };

  // ---- FILTERED CONTRACTS ----
  const filteredContracts = useMemo(() => {
    if (!Array.isArray(smartContracts)) return [];
    return smartContracts.filter((contract) => {
      if (!contract) return false;

      const matchesFilter = filter === 'all' || contract.status === filter;
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        contract.contractNumber?.toLowerCase().includes(term) ||
        contract.clientInfo?.firstName?.toLowerCase().includes(term) ||
        contract.clientInfo?.lastName?.toLowerCase().includes(term) ||
        contract.vehicleInfo?.nomVehicule?.toLowerCase().includes(term) ||
        contract.vehicleInfo?.numeroMatricule?.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [smartContracts, filter, searchTerm]);

  const contractsArray = Array.isArray(smartContracts) ? smartContracts : [];

  // ---------- RENDER ----------
  return (
    <div className="smart-contra-management">
      <div className="section-header">
        <h2>🚗 Contrats Véhicules Intelligents</h2>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={getAvailableSmartCars().length === 0}
          >
            + Nouveau Contrat Intelligent
          </button>
          {getAvailableSmartCars().length === 0 && (
            <small className="no-vehicles-warning">
              Aucun véhicule intelligent disponible
            </small>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{contractsArray.length}</div>
          <div className="stat-label">Total Contrats</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {contractsArray.filter((c) => c.status === 'active').length}
          </div>
          <div className="stat-label">Contrats Actifs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {contractsArray.filter((c) => c.status === 'pending').length}
          </div>
          <div className="stat-label">En Attente</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {contractsArray.filter((c) => c.status === 'completed').length}
          </div>
          <div className="stat-label">Complétés</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher un contrat intelligent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          {['all', 'pending', 'active', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              className={filter === st ? 'active' : ''}
              onClick={() => setFilter(st)}
            >
              {st === 'all'
                ? 'Tous'
                : st === 'pending'
                ? 'En Attente'
                : st === 'active'
                ? 'Actifs'
                : st === 'completed'
                ? 'Complétés'
                : 'Annulés'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Chargement des contrats intelligents...</span>
        </div>
      )}

      {/* MODAL FORM – I keep your structure, only minor cleanup */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h3>
                {editingContract
                  ? 'Modifier le Contrat Intelligent'
                  : 'Nouveau Contrat Véhicule Intelligent'}
              </h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            {/* FORM */}
            {/* 👉 Here you can reuse your full form JSX exactly as you wrote it.
                No need to change the layout: the only important change is the payload in handleSubmit. */}
            {/* ... (reuse your existing form sections: client/vehicle, conducteur, dates, taxes, paiement, etc.) */}
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="contracts-list">
        {filteredContracts.length === 0 ? (
          <div className="no-data">
            {searchTerm
              ? 'Aucun contrat intelligent trouvé pour votre recherche'
              : 'Aucun contrat intelligent disponible'}
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const days = calculateDays(contract.startDate, contract.endDate);
            const vehicleInfo = contract.vehicleInfo || {};

            return (
              <div key={contract._id} className="contract-card smart-contract-card">
                <div className="contract-header">
                  <div className="contract-info">
                    <h4>
                      Contrat Intelligent{' '}
                      {contract.contractNumber || `#${contract._id?.slice(-6)}`}
                    </h4>
                    <div className="contract-meta">
                      <span className={`status-badge status-${contract.status}`}>
                        {contract.status}
                      </span>
                      <span className="smart-car-badge">🚗 Véhicule Intelligent</span>
                    </div>
                  </div>
                  <div className="contract-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handlePrint(contract)}
                      title="Imprimer"
                    >
                      🖨️
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleDownload(contract)}
                      title="Télécharger"
                    >
                      📥
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEdit(contract)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(contract._id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="contract-details">
                  <div className="detail-row">
                    <div className="detail-item">
                      <strong>Client:</strong>{' '}
                      {contract.clientInfo?.firstName} {contract.clientInfo?.lastName}
                    </div>
                    <div className="detail-item">
                      <strong>Véhicule:</strong> {vehicleInfo.nomVehicule} (
                      {vehicleInfo.numeroMatricule})
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-item">
                      <strong>Période:</strong>{' '}
                      {contract.startDate
                        ? new Date(contract.startDate).toLocaleDateString('fr-FR')
                        : 'N/A'}{' '}
                      -{' '}
                      {contract.endDate
                        ? new Date(contract.endDate).toLocaleDateString('fr-FR')
                        : 'N/A'}
                    </div>
                    <div className="detail-item">
                      <strong>Durée:</strong> {days} jour(s)
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-item">
                      <strong>Total:</strong> €{contract.prixTotal || 0}
                    </div>
                    <div className="detail-item">
                      <strong>Paiement:</strong> {contract.methodPaiement}
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-item">
                      <strong>Réservoir:</strong> {contract.niveauReservoir || 'N/A'}%
                    </div>
                    {contract.dommages && contract.dommages.length > 0 && (
                      <div className="detail-item">
                        <strong>Parties endommagées:</strong> {contract.dommages.length}
                      </div>
                    )}
                  </div>
                  {contract.conducteur && (
                    <div className="detail-row">
                      <div className="detail-item">
                        <strong>Conducteur:</strong>{' '}
                        {contract.conducteur.prenom} {contract.conducteur.nom}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
[O          })
        )}
      </div>
    </div>
  );
};

export default SmartContra;
```

👉 In the form JSX area (commented `/* ... */`), just keep your existing sections – they already work with `formData` and `handleInputChange`.

---

## 2️⃣ Backend – Mongoose Model `Contrasmart`

You said you already have `User`, `Vehicle`, `SmartCar`, `Blacklist`.
Here is a **Contrasmart** schema that matches the payload above:

```js
// models/Contrasmart.js
const mongoose = require('mongoose');

const DommageSchema = new mongoose.Schema(
  {
    emplacement: String,
    description: String,
    type: String,
    date: Date,
  },
  { _id: false }
);

const AssuranceSchema = new mongoose.Schema(
  {
    compagnie: String,
    numero: String,
    dateDebut: Date,
    dateFin: Date,
  },
  { _id: false }
);

const ImpotSchema = new mongoose.Schema(
  {
    tva: { type: Number, default: 0 },
    taxeSejour: { type: Number, default: 0 },
    autresTaxes: { type: Number, default: 0 },
  },
  { _id: false }
);

const CardInfoSchema = new mongoose.Schema(
  {
    numero: String,
    nom: String,
    expiration: String,
    cvv: String,
  },
  { _id: false }
);

const ChequeInfoSchema = new mongoose.Schema(
  {
    numero: String,
    banque: String,
    dateEmission: Date,
  },
  { _id: false }
);

const ConducteurSchema = new mongoose.Schema(
  {
    nom: String,
    prenom: String,
    cin: String,
    permis: String,
    dateNaissance: Date,
    telephone: String,
  },
  { _id: false }
);

const ContrasmartSchema = new mongoose.Schema(
  {
    contractNumber: { type: String, required: true, unique: true },

    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'SmartCar', required: true },
    smartCarId: { type: mongoose.Schema.Types.ObjectId, ref: 'SmartCar' },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },

    prixVoiture: { type: Number, required: true },
    prixTotal: { type: Number, required: true },
    days: { type: Number, required: true },

    niveauReservoir: { type: Number, min: 0, max: 100 },

    assurance: AssuranceSchema,
    impot: ImpotSchema,
    dommages: [DommageSchema],

    methodPaiement: {
      type: String,
      enum: ['espece', 'carte', 'cheque'],
      default: 'espece',
    },
    cardInfo: CardInfoSchema,
    chequeInfo: ChequeInfoSchema,

    conducteur: ConducteurSchema,

    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: String,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    entreprise: String,

    // optionnel: garder snapshot pour affichage direct
    clientInfo: {
      firstName: String,
      lastName: String,
      cin: String,
      phone: String,
      email: String,
    },
    vehicleInfo: {
      nomVehicule: String,
      numeroMatricule: String,
      typeVehicule: String,
      boiteVitesse: String,
      typeCarburant: String,
      imageVehicule: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contrasmart', ContrasmartSchema);
```

---

## 3️⃣ Backend – Routes `/contrasmart` (Express)

Assuming you already have:

* `auth` middleware that puts `req.user.id`.
* `Client` model.
* `SmartCar` model.
* `Blacklist` model.

```js
// routes/contrasmart.js
const express = require('express');
const router = express.Router();

const Contrasmart = require('../models/Contrasmart');
const Client = require('../models/Client');
const SmartCar = require('../models/SmartCar');
const Blacklist = require('../models/Blacklist');
const auth = require('../middleware/auth');

// GET /contrasmart - all contracts for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const contracts = await Contrasmart.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate('clientId', 'firstName lastName cin phone email')
      .populate('vehicleId', 'nomVehicule numeroMatricule typeVehicule boiteVitesse typeCarburant imageVehicule');

    // On ajoute clientInfo & vehicleInfo pour matcher le front
    const formatted = contracts.map((c) => {
      const obj = c.toObject();
      return {
        ...obj,
        clientInfo: obj.clientInfo || obj.clientId || null,
        vehicleInfo: obj.vehicleInfo || obj.vehicleId || null,
      };
    });

    res.json({
      success: true,
      contrasmarts: formatted,
    });
  } catch (err) {
    console.error('❌ Erreur GET /contrasmart:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// GET /contrasmart/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const contract = await Contrasmart.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    })
      .populate('clientId', 'firstName lastName cin phone email')
      .populate('vehicleId', 'nomVehicule numeroMatricule typeVehicule boiteVitesse typeCarburant imageVehicule');

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contrat non trouvé' });
    }

    const obj = contract.toObject();
    res.json({
      success: true,
      contrasmart: {
        ...obj,
        clientInfo: obj.clientInfo || obj.clientId || null,
        vehicleInfo: obj.vehicleInfo || obj.vehicleId || null,
      },
    });
  } catch (err) {
    console.error('❌ Erreur GET /contrasmart/:id:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// POST /contrasmart - create contract
router.post('/', auth, async (req, res) => {
  try {
    const data = req.body;

    // Basic validation
    if (!data.clientId || !data.vehicleId || !data.startDate || !data.endDate) {
      return res
        .status(400)
        .json({ success: false, message: 'Champs obligatoires manquants' });
    }

    // Check blacklist (par client ou CIN conducteur)
    if (Blacklist) {
      const blacklisted = await Blacklist.findOne({
        $or: [
          { clientId: data.clientId },
          { cin: data.conducteur?.cin },
        ],
        active: true,
      });

      if (blacklisted) {
        return res.status(403).json({
          success: false,
          message: 'Client ou conducteur est en blacklist',
        });
      }
    }

    const smartCar = await SmartCar.findById(data.vehicleId);
    if (!smartCar) {
      return res
        .status(400)
        .json({ success: false, message: 'Véhicule intelligent introuvable' });
    }

    // Calcul jours si non envoyé
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const diffTime = Math.abs(endDate - startDate);
    const days = data.days || Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const newContract = new Contrasmart({
      ...data,
      days,
      createdBy: req.user.id,
      entreprise: data.entreprise || undefined,
    });

    const saved = await newContract.save();

    res.status(201).json({
      success: true,
      message: 'Contrat intelligent créé',
      contrasmart: saved,
    });
  } catch (err) {
    console.error('❌ Erreur POST /contrasmart:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// PUT /contrasmart/:id - update
router.put('/:id', auth, async (req, res) => {
  try {
    const data = req.body;

    const contract = await Contrasmart.findOne({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contrat non trouvé' });
    }

    // option: re-check blacklist si client ou conducteur changent
    if (Blacklist) {
      const blacklisted = await Blacklist.findOne({
        $or: [
          { clientId: data.clientId },
          { cin: data.conducteur?.cin },
        ],
        active: true,
      });

      if (blacklisted) {
        return res.status(403).json({
          success: false,
          message: 'Client ou conducteur est en blacklist',
        });
      }
    }

    // Update
    Object.assign(contract, data);
    const saved = await contract.save();

    res.json({
      success: true,
      message: 'Contrat intelligent mis à jour',
      contrasmart: saved,
    });
  } catch (err) {
    console.error('❌ Erreur PUT /contrasmart/:id:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// DELETE /contrasmart/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Contrasmart.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Contrat non trouvé' });
    }

    res.json({ success: true, message: 'Contrat intelligent supprimé' });
  } catch (err) {
    console.error('❌ Erreur DELETE /contrasmart/:id:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
```

Then in your main server:

```js
// server.js / app.js
const contrasmartRoutes = require('./routes/contrasmart');

app.use('/contrasmart', contrasmartRoutes); 
// ou '/api/contrasmart' et côté front tu utilises api.get('/api/contrasmart')
```

---

If you want, next step I can:

* Adapt your **print template** to use exactly the new schema.
* Add an endpoint like `PATCH /contrasmart/:id/status` to change status quickly (pending → active → completed).

