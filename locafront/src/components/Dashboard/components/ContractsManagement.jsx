// components/ContractsManagement.jsx
import React, { useState } from 'react';
import api from '../../../utils/api';
import ContractForm from './forms/ContractForm';
import ContractsList from './lists/ContractsList';

const ContractsManagement = ({ user, vehicles, contracts, setContracts, setMessage, loadContracts }) => {
  const [contractForm, setContractForm] = useState({
    // Client information
    clientLastName: '',
    clientFirstName: '',
    clientBirthDate: '',
    clientPhone: '',
    clientAddress: '',
    clientPassport: '',
    clientCIN: '',
    clientLicenseNumber: '',
    clientLicenseIssueDate: '',

    // Second driver information
    secondDriverLastName: '',
    secondDriverFirstName: '',
    secondDriverLicenseNumber: '',
    secondDriverLicenseIssueDate: '',

    // Rental information
    vehicleId: '',
    startDateTime: '',
    endDateTime: '',
    startLocation: '',
    endLocation: '',
    prixParJour: '',
    prixTotal: 0
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  const handleContractChange = (e) => {
    const { name, value } = e.target;
    setContractForm({ ...contractForm, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const checkBlacklist = async (cin, passport) => {
    try {
      const response = await api.get('/blacklist/check', {
        params: { cin, passport }
      });
      return response.data.isBlacklisted;
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return false;
    }
  };

  const createContract = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!contractForm.clientLastName || !contractForm.clientFirstName || !contractForm.clientBirthDate ||
        !contractForm.clientPhone || !contractForm.clientAddress || !contractForm.clientLicenseNumber ||
        !contractForm.clientLicenseIssueDate || !contractForm.vehicleId || !contractForm.startDateTime ||
        !contractForm.endDateTime || !contractForm.startLocation || !contractForm.endLocation) {
      setMessage('❌ Veuillez remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    try {
      // Check blacklist using CIN or passport
      const isBlacklisted = await checkBlacklist(contractForm.clientCIN, contractForm.clientPassport);
      if (isBlacklisted) {
        setMessage('❌ Ce client est dans la liste noire! Contrat non autorisé.');
        setLoading(false);
        return;
      }

      // Get selected vehicle details from database
      const selectedVehicle = vehicles.find(v => v._id === contractForm.vehicleId);
      if (!selectedVehicle) {
        setMessage('❌ Véhicule non trouvé.');
        setLoading(false);
        return;
      }

      // Use custom price if provided, otherwise use vehicle's price
      const prixParJour = contractForm.prixParJour || selectedVehicle.pricePerDay;

      // Calculate rental days for total price
      const start = new Date(contractForm.startDateTime);
      const end = new Date(contractForm.endDateTime);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const rentalDays = diffDays === 0 ? 1 : diffDays;
      const prixTotal = rentalDays * prixParJour;

      // Create contract data with ALL vehicle details and COMPLETE user information
      const contractData = {
        // 1. COMPLETE User/Partner information
        partnerInfo: {
          partnerId: user._id || user.id,
          partnerName: user.entreprise || user.name,
          partnerEmail: user.email,
          partnerPhone: user.number || user.telephone,
          partnerLogo: user.logoEntreprise,
          partnerCountry: user.country,
          partnerCity: user.city,
          partnerStatus: user.status,
          partnerRole: user.role,
          partnerCreatedAt: user.createdAt,
          partnerUpdatedAt: user.updatedAt
        },

        // 2. Client/Locataire information
        clientInfo: {
          lastName: contractForm.clientLastName,
          firstName: contractForm.clientFirstName,
          birthDate: contractForm.clientBirthDate,
          phone: contractForm.clientPhone,
          address: contractForm.clientAddress,
          passport: contractForm.clientPassport,
          cin: contractForm.clientCIN,
          licenseNumber: contractForm.clientLicenseNumber,
          licenseIssueDate: contractForm.clientLicenseIssueDate
        },

        // Second driver information
        secondDriverInfo: {
          lastName: contractForm.secondDriverLastName,
          firstName: contractForm.secondDriverFirstName,
          licenseNumber: contractForm.secondDriverLicenseNumber,
          licenseIssueDate: contractForm.secondDriverLicenseIssueDate
        },

        // 3. Complete vehicle information
        vehicleInfo: {
          vehicleId: selectedVehicle._id,
          name: selectedVehicle.name,
          type: selectedVehicle.type,
          boiteVitesse: selectedVehicle.boiteVitesse,
          description: selectedVehicle.description,
          image: selectedVehicle.image,
          pricePerDay: selectedVehicle.pricePerDay,
          carburant: selectedVehicle.carburant,
          niveauReservoir: selectedVehicle.niveauReservoir,
          radio: selectedVehicle.radio,
          gps: selectedVehicle.gps,
          mp3: selectedVehicle.mp3,
          cd: selectedVehicle.cd,
          nombreCles: selectedVehicle.nombreCles,
          kmDepart: selectedVehicle.kmDepart,
          kmRetour: selectedVehicle.kmRetour,
          impot2026: selectedVehicle.impot2026,
          impot2027: selectedVehicle.impot2027,
          impot2028: selectedVehicle.impot2028,
          impot2029: selectedVehicle.impot2029,
          assuranceStartDate: selectedVehicle.assuranceStartDate,
          assuranceEndDate: selectedVehicle.assuranceEndDate,
          vidangeInterval: selectedVehicle.vidangeInterval,
          remarques: selectedVehicle.remarques,
          dommages: selectedVehicle.dommages,
          available: selectedVehicle.available,
          createdAt: selectedVehicle.createdAt,
          updatedAt: selectedVehicle.updatedAt
        },

        // Rental information
        rentalInfo: {
          startDateTime: contractForm.startDateTime,
          endDateTime: contractForm.endDateTime,
          startLocation: contractForm.startLocation,
          endLocation: contractForm.endLocation,
          prixParJour: prixParJour,
          prixTotal: prixTotal,
          rentalDays: rentalDays
        },

        // Contract metadata
        contractMetadata: {
          createdBy: user._id || user.id,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      };

      console.log('📤 Données complètes du contrat envoyées:', contractData);
      console.log('👤 COMPLETE Informations utilisateur:', user);
      console.log('🚗 Véhicule sélectionné:', selectedVehicle);

      // Send complete contract data to server
      const res = await api.post('/contracts', contractData);

      console.log('✅ Réponse du serveur:', res.data);

      // Reset form
      setContractForm({
        clientLastName: '',
        clientFirstName: '',
        clientBirthDate: '',
        clientPhone: '',
        clientAddress: '',
        clientPassport: '',
        clientCIN: '',
        clientLicenseNumber: '',
        clientLicenseIssueDate: '',
        secondDriverLastName: '',
        secondDriverFirstName: '',
        secondDriverLicenseNumber: '',
        secondDriverLicenseIssueDate: '',
        vehicleId: '',
        startDateTime: '',
        endDateTime: '',
        startLocation: '',
        endLocation: '',
        prixParJour: '',
        prixTotal: 0
      });
      setShowForm(false);
      setErrors({});

      // Reload contracts
      await loadContracts();

      setMessage('✅ Contrat créé avec succès! Toutes les informations ont été sauvegardées.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('❌ Erreur création contrat:', err);
      console.error('Détails erreur:', err.response?.data);

      // More detailed error information
      if (err.response?.data?.errors) {
        console.error('Erreurs de validation:', err.response.data.errors);
        const validationErrors = err.response.data.errors;
        if (validationErrors.partnerName) {
          setMessage(`❌ Erreur partenaire: ${validationErrors.partnerName.message}`);
        } else {
          setMessage('❌ Erreur de validation des données');
        }
      } else {
        setMessage('❌ Erreur lors de la création du contrat: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateContract = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get selected vehicle details
      const selectedVehicle = vehicles.find(v => v._id === contractForm.vehicleId);
      if (!selectedVehicle) {
        setMessage('❌ Véhicule non trouvé.');
        setLoading(false);
        return;
      }

      // Use custom price if provided, otherwise use vehicle's price
      const prixParJour = contractForm.prixParJour || selectedVehicle.pricePerDay;

      // Calculate rental days for total price
      const start = new Date(contractForm.startDateTime);
      const end = new Date(contractForm.endDateTime);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const rentalDays = diffDays === 0 ? 1 : diffDays;
      const prixTotal = rentalDays * prixParJour;

      // Create complete contract data for update with ALL user information
      const contractData = {
        // 1. COMPLETE User/Partner information
        partnerInfo: {
          partnerId: user._id || user.id,
          partnerName: user.entreprise || user.name,
          partnerEmail: user.email,
          partnerPhone: user.number || user.telephone,
          partnerLogo: user.logoEntreprise,
          partnerCountry: user.country,
          partnerCity: user.city,
          partnerStatus: user.status,
          partnerRole: user.role,
          partnerCreatedAt: user.createdAt,
          partnerUpdatedAt: user.updatedAt
        },

        // 2. Client information
        clientInfo: {
          lastName: contractForm.clientLastName,
          firstName: contractForm.clientFirstName,
          birthDate: contractForm.clientBirthDate,
          phone: contractForm.clientPhone,
          address: contractForm.clientAddress,
          passport: contractForm.clientPassport,
          cin: contractForm.clientCIN,
          licenseNumber: contractForm.clientLicenseNumber,
          licenseIssueDate: contractForm.clientLicenseIssueDate
        },

        // Second driver information
        secondDriverInfo: {
          lastName: contractForm.secondDriverLastName,
          firstName: contractForm.secondDriverFirstName,
          licenseNumber: contractForm.secondDriverLicenseNumber,
          licenseIssueDate: contractForm.secondDriverLicenseIssueDate
        },

        // 3. Complete vehicle information
        vehicleInfo: {
          vehicleId: selectedVehicle._id,
          name: selectedVehicle.name,
          type: selectedVehicle.type,
          boiteVitesse: selectedVehicle.boiteVitesse,
          description: selectedVehicle.description,
          image: selectedVehicle.image,
          pricePerDay: selectedVehicle.pricePerDay,
          carburant: selectedVehicle.carburant,
          niveauReservoir: selectedVehicle.niveauReservoir,
          radio: selectedVehicle.radio,
          gps: selectedVehicle.gps,
          mp3: selectedVehicle.mp3,
          cd: selectedVehicle.cd,
          nombreCles: selectedVehicle.nombreCles,
          kmDepart: selectedVehicle.kmDepart,
          kmRetour: selectedVehicle.kmRetour,
          impot2026: selectedVehicle.impot2026,
          impot2027: selectedVehicle.impot2027,
          impot2028: selectedVehicle.impot2028,
          impot2029: selectedVehicle.impot2029,
          assuranceStartDate: selectedVehicle.assuranceStartDate,
          assuranceEndDate: selectedVehicle.assuranceEndDate,
          vidangeInterval: selectedVehicle.vidangeInterval,
          remarques: selectedVehicle.remarques,
          dommages: selectedVehicle.dommages,
          available: selectedVehicle.available
        },

        // Rental information
        rentalInfo: {
          startDateTime: contractForm.startDateTime,
          endDateTime: contractForm.endDateTime,
          startLocation: contractForm.startLocation,
          endLocation: contractForm.endLocation,
          prixParJour: prixParJour,
          prixTotal: prixTotal,
          rentalDays: rentalDays
        },

        // Status
        status: contractForm.status || 'pending'
      };

      console.log('📤 Mise à jour complète du contrat:', contractData);

      const res = await api.put(`/contracts/${editingContract._id}`, contractData);

      // Reset form
      setContractForm({
        clientLastName: '',
        clientFirstName: '',
        clientBirthDate: '',
        clientPhone: '',
        clientAddress: '',
        clientPassport: '',
        clientCIN: '',
        clientLicenseNumber: '',
        clientLicenseIssueDate: '',
        secondDriverLastName: '',
        secondDriverFirstName: '',
        secondDriverLicenseNumber: '',
        secondDriverLicenseIssueDate: '',
        vehicleId: '',
        startDateTime: '',
        endDateTime: '',
        startLocation: '',
        endLocation: '',
        prixParJour: '',
        prixTotal: 0
      });
      setShowForm(false);
      setEditingContract(null);
      setErrors({});

      // Reload contracts
      await loadContracts();

      setMessage('✅ Contrat modifié avec succès! Toutes les informations ont été mises à jour.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('❌ Erreur modification contrat:', err);
      console.error('Détails erreur:', err.response?.data);
      setMessage('❌ Erreur lors de la modification du contrat: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteContract = async (contractId) => {
    try {
      await api.delete(`/contracts/${contractId}`);

      // Update local state
      setContracts(contracts.filter(contract => contract._id !== contractId));

      setMessage('✅ Contrat supprimé avec succès!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur suppression contrat:', err);
      setMessage('❌ Erreur lors de la suppression du contrat: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateContractStatus = async (contractId, status) => {
    try {
      await api.patch(`/contracts/${contractId}`, { status });

      // Update local state
      setContracts(contracts.map(contract =>
        contract._id === contractId ? { ...contract, status } : contract
      ));

      setMessage(`✅ Statut du contrat mis à jour: ${status}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur changement statut contrat:', err);
      setMessage('❌ Erreur lors du changement de statut: ' + (err.response?.data?.message || err.message));
    }
  };

  const downloadContract = (contract) => {
    const contractWindow = window.open('', '_blank');
    const partnerName = user.entreprise || user.name;
    const partnerLogo = user.logoEntreprise || '';

    // Format dates for display
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Use the complete vehicle information stored in the contract
    const vehicleInfo = contract.vehicleInfo ? contract.vehicleInfo : null;
    // Use the complete partner information stored in the contract
    const partnerInfo = contract.partnerInfo ? contract.partnerInfo : user;

    // Get vehicle image
    const vehicleImage = vehicleInfo?.image || '';

    contractWindow.document.write(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contrat de Location - ${contract.clientInfo.firstName} ${contract.clientInfo.lastName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        body {
            font-family: 'Inter', Arial, sans-serif;
            background: #fff;
            color: #000;
            margin: 0;
            padding: 15px;
            font-size: 9px;
            line-height: 1.2;
        }

        .contract-container {
            background: #fff;
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
        }

        /* ---- HEADER ---- */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #000;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }

        .logo-container {
            width: 60px;
            height: 60px;
            border-radius: 5px;
            overflow: hidden;
        }

        .logo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .company-info {
            flex: 1;
            margin-left: 15px;
        }

        .company-info h1 {
            margin: 0;
            font-size: 12px;
            font-weight: 600;
            color: #000;
            text-transform: uppercase;
        }

        .company-info p {
            margin: 2px 0;
            font-size: 8px;
        }

        .contract-number {
            background: #000;
            color: white;
            padding: 4px 8px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: 600;
        }

        /* ---- SECTIONS ---- */
        .section {
            background: #f8f8f8;
            border-radius: 5px;
            padding: 10px;
            margin-bottom: 12px;
            border: 1px solid #ccc;
        }

        .section h3 {
            font-size: 10px;
            font-weight: 600;
            border-bottom: 1px solid #ccc;
            padding-bottom: 4px;
            margin-bottom: 8px;
            color: #000;
        }

        /* ---- TABLES ---- */
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 5px 0;
        }

        .info-table th {
            background: #000;
            color: white;
            text-align: left;
            padding: 6px 8px;
            font-weight: 600;
            font-size: 8px;
        }

        .info-table td {
            padding: 4px 6px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
            font-size: 8px;
        }

        .info-table tr:last-child td {
            border-bottom: none;
        }

        .info-table .label {
            font-weight: 600;
            width: 35%;
            color: #000;
        }

        .info-table .value {
            width: 65%;
        }

        .two-column-table {
            width: 100%;
            border-collapse: collapse;
            margin: 8px 0;
        }

        .two-column-table th {
            background: #e0e0e0;
            color: #000;
            text-align: left;
            padding: 6px 8px;
            font-weight: 600;
            font-size: 8px;
            border: 1px solid #ccc;
        }

        .two-column-table td {
            padding: 6px 8px;
            border: 1px solid #ccc;
            vertical-align: top;
            font-size: 8px;
        }

        /* ---- GRID INFO ---- */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .info-item {
            background: #fff;
            padding: 6px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }

        .info-item strong {
            display: block;
            margin-bottom: 2px;
            font-weight: 600;
            color: #000;
            font-size: 8px;
        }

        .highlight {
            background: #f0f0f0;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }

        .vehicle-image-container {
            text-align: center;
            margin: 10px 0;
        }

        .vehicle-image {
            max-width: 200px;
            border-radius: 5px;
            border: 1px solid #aaa;
        }

        .damages-list {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-top: 4px;
        }

        .damage-tag {
            background: #f1c40f;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 7px;
        }

        .equipment-tag {
            background: #3498db;
            color: #fff;
            padding: 2px 4px;
            border-radius: 6px;
            font-size: 7px;
            margin-right: 3px;
        }

        /* ---- SIGNATURE ---- */
        .signature {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
        }

        .signature-box {
            border: 1px dashed #999;
            border-radius: 4px;
            padding: 12px;
            text-align: center;
            background: #fafafa;
        }

        .footer {
            margin-top: 15px;
            font-size: 7px;
            color: #555;
            text-align: center;
            border-top: 1px solid #ccc;
            padding-top: 6px;
        }

        ul {
            margin: 0;
            padding-left: 15px;
        }

        ul li {
            margin-bottom: 3px;
            font-size: 8px;
        }

        .total-price {
            background: #f1c40f;
            color: #000;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 3px;
            text-align: center;
            font-size: 8px;
        }

        .compact-row {
            margin: 2px 0;
        }

        .compact-field {
            display: inline-block;
            margin-right: 10px;
            font-size: 8px;
        }

        .compact-label {
            font-weight: 600;
            margin-right: 3px;
        }
    </style>
</head>
<body>
    <div class="contract-container">
        <div class="header">
            <div style="display: flex; align-items: center;">
                ${partnerLogo ? `
                <div class="logo-container">
                    <img src="${partnerLogo}" alt="Logo ${partnerName}" />
                </div>
                ` : ''}
                <div class="company-info">
                    <h1>CONTRAT DE LOCATION DE VEHICULE</h1>
                    <p><strong>${partnerName}</strong></p>
                    <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
                </div>
            </div>
            <div class="contract-number">
                Contrat: ${contract._id}
            </div>
        </div>

        <div class="section">
            <h3>INFORMATIONS DES PARTIES</h3>
            <table class="two-column-table">
                <tr>
                    <th>LOUEUR</th>
                    <th>LOCATAIRE</th>
                </tr>
                <tr>
                    <td>
                        <table class="info-table">
                            <tr><td class="label">Entreprise:</td><td class="value">${partnerInfo.partnerName || partnerName}</td></tr>
                            <tr><td class="label">ID:</td><td class="value">${partnerInfo.partnerId || user._id || user.id}</td></tr>
                            <tr><td class="label">Email:</td><td class="value">${partnerInfo.partnerEmail || user.email}</td></tr>
                            <tr><td class="label">Telephone:</td><td class="value">${partnerInfo.partnerPhone || user.number || user.telephone || 'Non specifie'}</td></tr>
                            <tr><td class="label">Pays:</td><td class="value">${partnerInfo.partnerCountry || user.country || 'Non specifie'}</td></tr>
                            <tr><td class="label">Ville:</td><td class="value">${partnerInfo.partnerCity || user.city || 'Non specifie'}</td></tr>
                        </table>
                    </td>
                    <td>
                        <table class="info-table">
                            <tr><td class="label">Nom:</td><td class="value">${contract.clientInfo.lastName}</td></tr>
                            <tr><td class="label">Prenom:</td><td class="value">${contract.clientInfo.firstName}</td></tr>
                            <tr><td class="label">Naissance:</td><td class="value">${contract.clientInfo.birthDate ? new Date(contract.clientInfo.birthDate).toLocaleDateString('fr-FR') : 'Non specifiee'}</td></tr>
                            <tr><td class="label">Telephone:</td><td class="value">${contract.clientInfo.phone}</td></tr>
                            <tr><td class="label">Adresse:</td><td class="value">${contract.clientInfo.address}</td></tr>
                            <tr><td class="label">Passeport:</td><td class="value">${contract.clientInfo.passport || 'Non specifie'}</td></tr>
                            <tr><td class="label">CIN:</td><td class="value">${contract.clientInfo.cin || 'Non specifie'}</td></tr>
                            <tr><td class="label">Permis:</td><td class="value">${contract.clientInfo.licenseNumber}</td></tr>
                            <tr><td class="label">Delivre le:</td><td class="value">${contract.clientInfo.licenseIssueDate ? new Date(contract.clientInfo.licenseIssueDate).toLocaleDateString('fr-FR') : 'Non specifie'}</td></tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>

        ${contract.secondDriverInfo && (contract.secondDriverInfo.lastName || contract.secondDriverInfo.firstName) ? `
        <div class="section">
            <h3>DEUXIEME CONDUCTEUR</h3>
            <div class="highlight">
                <table class="info-table">
                    <tr><td class="label">Nom:</td><td class="value">${contract.secondDriverInfo.lastName}</td></tr>
                    <tr><td class="label">Prenom:</td><td class="value">${contract.secondDriverInfo.firstName}</td></tr>
                    <tr><td class="label">Permis:</td><td class="value">${contract.secondDriverInfo.licenseNumber || 'Non specifie'}</td></tr>
                    <tr><td class="label">Delivre le:</td><td class="value">${contract.secondDriverInfo.licenseIssueDate ? new Date(contract.secondDriverInfo.licenseIssueDate).toLocaleDateString('fr-FR') : 'Non specifie'}</td></tr>
                </table>
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h3>VEHICULE LOUE</h3>
            <div class="highlight">
                ${vehicleInfo ? `
                    ${vehicleImage ? `
                    <div class="vehicle-image-container">
                        <img src="${vehicleImage}" alt="${vehicleInfo.name}" class="vehicle-image" />
                    </div>
                    ` : ''}

                    <table class="info-table">
                        <tr><td class="label">Vehicule:</td><td class="value">${vehicleInfo.name}</td></tr>
                        <tr><td class="label">Type:</td><td class="value">${vehicleInfo.type}</td></tr>
                        <tr><td class="label">Boite vitesse:</td><td class="value">${vehicleInfo.boiteVitesse}</td></tr>
                        <tr><td class="label">Carburant:</td><td class="value">${vehicleInfo.carburant || 'Non specifie'}</td></tr>
                        <tr><td class="label">Niveau reservoir:</td><td class="value">${vehicleInfo.niveauReservoir || 'Non specifie'}</td></tr>
                        <tr><td class="label">KM depart:</td><td class="value">${vehicleInfo.kmDepart || 'Non specifie'} km</td></tr>
                        <tr><td class="label">KM retour:</td><td class="value">${vehicleInfo.kmRetour || 'Non specifie'} km</td></tr>
                        <tr><td class="label">Nombre cles:</td><td class="value">${vehicleInfo.nombreCles || 'Non specifie'}</td></tr>
                        <tr><td class="label">Equipements:</td><td class="value">
                            ${vehicleInfo.radio ? '<span class="equipment-tag">Radio</span>' : ''}
                            ${vehicleInfo.gps ? '<span class="equipment-tag">GPS</span>' : ''}
                            ${vehicleInfo.mp3 ? '<span class="equipment-tag">MP3</span>' : ''}
                            ${vehicleInfo.cd ? '<span class="equipment-tag">CD</span>' : ''}
                            ${!vehicleInfo.radio && !vehicleInfo.gps && !vehicleInfo.mp3 && !vehicleInfo.cd ? 'Aucun equipement' : ''}
                        </td></tr>
                        <tr><td class="label">Prix/jour:</td><td class="value">${contract.rentalInfo.prixParJour || vehicleInfo.pricePerDay} DH</td></tr>
                        ${vehicleInfo.description ? `<tr><td class="label">Description:</td><td class="value">${vehicleInfo.description}</td></tr>` : ''}
                        ${vehicleInfo.remarques ? `<tr><td class="label">Remarques:</td><td class="value">${vehicleInfo.remarques}</td></tr>` : ''}
                        ${vehicleInfo.dommages && vehicleInfo.dommages.length > 0 ? `
                        <tr><td class="label">Dommages:</td><td class="value">
                            <div class="damages-list">
                                ${vehicleInfo.dommages.map(damage => `<span class="damage-tag">${damage}</span>`).join('')}
                            </div>
                        </td></tr>
                        ` : ''}
                        ${vehicleInfo.assuranceStartDate && vehicleInfo.assuranceEndDate ? `
                        <tr><td class="label">Assurance:</td><td class="value">
                            Du ${new Date(vehicleInfo.assuranceStartDate).toLocaleDateString('fr-FR')}
                            au ${new Date(vehicleInfo.assuranceEndDate).toLocaleDateString('fr-FR')}
                        </td></tr>
                        ` : ''}
                    </table>
                ` : '<p>Informations vehicule non disponibles</p>'}
            </div>
        </div>

        <div class="section">
            <h3>DETAILS LOCATION</h3>
            <div class="highlight">
                <table class="info-table">
                    <tr><td class="label">Depart:</td><td class="value">${formatDate(contract.rentalInfo.startDateTime)}</td></tr>
                    <tr><td class="label">Retour:</td><td class="value">${formatDate(contract.rentalInfo.endDateTime)}</td></tr>
                    <tr><td class="label">Lieu depart:</td><td class="value">${contract.rentalInfo.startLocation}</td></tr>
                    <tr><td class="label">Lieu retour:</td><td class="value">${contract.rentalInfo.endLocation}</td></tr>
                    <tr><td class="label">Duree:</td><td class="value">${contract.rentalInfo.rentalDays} jours</td></tr>
                    <tr><td class="label">Prix/jour:</td><td class="value">${contract.rentalInfo.prixParJour} DH</td></tr>
                    <tr><td class="label">Total:</td><td class="value"><div class="total-price">${contract.rentalInfo.prixTotal} DH</div></td></tr>
                </table>
            </div>
        </div>

        <div class="section">
            <h3>CONDITIONS GENERALES</h3>
            <div class="highlight">
                <ul>
                    <li>Restitution du vehicule dans l'etat initial</li>
                    <li>Dommages a charge du client</li>
                    <li>Carburant a charge du client</li>
                    <li>Retard: majoration 50% du prix journalier</li>
                    <li>Plein de carburant obligatoire</li>
                    <li>Interdiction de fumer</li>
                    <li>Presentation permis et piece identite</li>
                    <li>Caution: 5000 DH</li>
                    <li>Kilometrage illimite</li>
                    <li>Assurance tous risques incluse</li>
                </ul>
            </div>
        </div>

        <div class="signature">
            <div class="signature-box">
                <p style="font-weight: 600; margin-bottom: 6px; font-size: 9px;">SIGNATURE CLIENT</p>
                <p style="margin-bottom: 10px; font-size: 8px;">${contract.clientInfo.firstName} ${contract.clientInfo.lastName}</p>
                <p style="color: #555; font-size: 7px;">CIN: ${contract.clientInfo.cin || 'Non specifie'}</p>
            </div>
            <div class="signature-box">
                <p style="font-weight: 600; margin-bottom: 6px; font-size: 9px;">SIGNATURE PARTENAIRE</p>
                <p style="margin-bottom: 10px; font-size: 8px;">${partnerName}</p>
                <p style="color: #555; font-size: 7px;">Entreprise: ${partnerName}</p>
            </div>
        </div>

        <div class="footer">
            <p>Contrat genere par WegoRent - ${partnerName} - ${new Date().toLocaleDateString('fr-FR')}</p>
            <p>Contact: ${user.email}</p>
            <p style="margin-top: 5px; font-size: 6px; color: #777;">
                Document contractuel - A conserver
            </p>
        </div>
    </div>
</body>
</html>
    `);
    contractWindow.document.close();
    contractWindow.print();
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setContractForm({
      // Client information
      clientLastName: contract.clientInfo?.lastName || '',
      clientFirstName: contract.clientInfo?.firstName || '',
      clientBirthDate: contract.clientInfo?.birthDate ? contract.clientInfo.birthDate.split('T')[0] : '',
      clientPhone: contract.clientInfo?.phone || '',
      clientAddress: contract.clientInfo?.address || '',
      clientPassport: contract.clientInfo?.passport || '',
      clientCIN: contract.clientInfo?.cin || '',
      clientLicenseNumber: contract.clientInfo?.licenseNumber || '',
      clientLicenseIssueDate: contract.clientInfo?.licenseIssueDate ? contract.clientInfo.licenseIssueDate.split('T')[0] : '',

      // Second driver information
      secondDriverLastName: contract.secondDriverInfo?.lastName || '',
      secondDriverFirstName: contract.secondDriverInfo?.firstName || '',
      secondDriverLicenseNumber: contract.secondDriverInfo?.licenseNumber || '',
      secondDriverLicenseIssueDate: contract.secondDriverInfo?.licenseIssueDate ? contract.secondDriverInfo.licenseIssueDate.split('T')[0] : '',

      // Rental information
      vehicleId: contract.vehicleInfo?.vehicleId || '',
      startDateTime: contract.rentalInfo?.startDateTime ? contract.rentalInfo.startDateTime.slice(0, 16) : '',
      endDateTime: contract.rentalInfo?.endDateTime ? contract.rentalInfo.endDateTime.slice(0, 16) : '',
      startLocation: contract.rentalInfo?.startLocation || '',
      endLocation: contract.rentalInfo?.endLocation || '',
      prixParJour: contract.rentalInfo?.prixParJour || '',
      prixTotal: contract.rentalInfo?.prixTotal || 0
    });
    setShowForm(true);
    setErrors({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContract(null);
    setContractForm({
      clientLastName: '',
      clientFirstName: '',
      clientBirthDate: '',
      clientPhone: '',
      clientAddress: '',
      clientPassport: '',
      clientCIN: '',
      clientLicenseNumber: '',
      clientLicenseIssueDate: '',
      secondDriverLastName: '',
      secondDriverFirstName: '',
      secondDriverLicenseNumber: '',
      secondDriverLicenseIssueDate: '',
      vehicleId: '',
      startDateTime: '',
      endDateTime: '',
      startLocation: '',
      endLocation: '',
      prixParJour: '',
      prixTotal: 0
    });
    setErrors({});
  };

  // If not showing form, display the create contract button
  if (!showForm) {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => setShowForm(true)}
            className="add-contract-btn"
            style={{
              padding: '12px 24px',
              backgroundColor: '#36c275',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.backgroundColor = '#2da861';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#36c275';
            }}
          >
            + Créer un Contrat
          </button>
        </div>
        <ContractsList
          contracts={contracts}
          vehicles={vehicles}
          onEdit={handleEdit}
          onDelete={deleteContract}
          onDownload={downloadContract}
          onUpdateStatus={updateContractStatus}
        />
      </div>
    );
  }

  return (
    <div>
      <ContractForm
        contractForm={contractForm}
        vehicles={vehicles}
        errors={errors}
        loading={loading}
        isEditing={!!editingContract}
        handleContractChange={handleContractChange}
        createContract={createContract}
        updateContract={updateContract}
        setShowForm={setShowForm}
        setContractForm={setContractForm}
        setErrors={setErrors}
      />
      <ContractsList
        contracts={contracts}
        vehicles={vehicles}
        onEdit={handleEdit}
        onDelete={deleteContract}
        onDownload={downloadContract}
        onUpdateStatus={updateContractStatus}
      />
    </div>
  );
};

export default ContractsManagement;
