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
    <title>Contrat de Location - ${contract.clientInfo.firstName} ${contract.clientInfo.lastName}</title>

    <!-- MATERIAL ICONS -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', Arial, sans-serif;
            background: linear-gradient(135deg, #F8FAFF 0%, #EEF3FF 40%, #E4ECFF 100%);
            color: #0A1F44;
            margin: 0;
            padding: 20px;
            font-size: 13px;
        }

        /* ===== PAGE (RECTO / VERSO) ===== */
        .contract-page {
            max-width: 800px;
            margin: 0 auto 20px;
            background: #fff;
            padding: 24px 26px;
            border-radius: 8px;
            border: 1px solid #dce3f7;
        }

        .contract-container {
            width: 100%;
        }

        /* ===== HEADER ===== */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #E4ECFF;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }

        .logo-container {
            width: 70px;
            height: 70px;
            border-radius: 8px;
            overflow: hidden;
            background: #EEF3FF;
            display: flex;
            justify-content: center;
            align-items: center;
            border: 1px solid #dce3f7;
        }

        .logo-container img {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        .company-info h1 {
            font-size: 18px;
            font-weight: 700;
            margin: 0 0 4px 0;
            color: #0A1F44;
        }

        .company-info p {
            margin: 0;
            font-size: 11px;
        }

        .contract-number {
            background: #0052CC;
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            text-align: center;
        }

        /* ===== SECTIONS ===== */
        .section {
            background: #F8FAFF;
            padding: 14px;
            border-radius: 8px;
            margin-bottom: 14px;
            border: 1px solid #E4ECFF;
        }

        .section h3 {
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #0052CC;
            padding-bottom: 5px;
            border-bottom: 1px solid #d3dcff;
        }

        /* ===== TABLES ===== */
        .info-table,
        .two-column-table {
            width: 100%;
            border-collapse: collapse;
        }

        .two-column-table th {
            background: #EEF3FF;
            padding: 6px 8px;
            border: 1px solid #dce3f7;
            font-size: 11px;
            color: #0A1F44;
            text-transform: uppercase;
        }

        .two-column-table td {
            border: 1px solid #dce3f7;
            padding: 0;
            vertical-align: top;
        }

        .info-table td {
            padding: 6px 10px;
            border-bottom: 1px solid #E4ECFF;
            font-size: 11px;
        }

        .info-table tr:last-child td {
            border-bottom: none;
        }

        .info-table .label {
            font-weight: 600;
            color: #0A1F44;
            width: 40%;
        }

        .info-table .value {
            width: 60%;
        }

        /* ===== VEHICLE IMAGE ===== */
        .vehicle-image-container {
            text-align: center;
            margin-bottom: 10px;
        }

        .vehicle-image {
            max-width: 200px;
            border-radius: 6px;
            border: 2px solid #dce3f7;
        }

        /* ===== ICONS FOR EQUIPMENT ===== */
        .equipment-tag {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            background: #0052CC;
            color: #fff;
            padding: 3px 9px;
            border-radius: 16px;
            font-size: 10px;
            margin-right: 5px;
            margin-bottom: 4px;
        }

        .equipment-tag i {
            font-size: 13px;
        }

        /* ===== DAMAGES TAGS ===== */
        .damages-list {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
        }

        .damage-tag {
            background: #FFCE54;
            padding: 3px 8px;
            border-radius: 16px;
            border: 1px solid #e0a000;
            font-size: 10px;
        }

        /* ===== TOTAL PRICE ===== */
        .total-price {
            background: #0052CC;
            color: #fff;
            padding: 4px 8px;
            border-radius: 5px;
            font-size: 12px;
            display: inline-block;
        }

        /* ===== SIGNATURES ===== */
        .signature {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 16px;
        }

        .signature-box {
            border: 1px dashed #d0daf8;
            padding: 14px;
            border-radius: 8px;
            background: #F8FAFF;
            text-align: center;
            font-size: 11px;
        }

        .footer {
            margin-top: 16px;
            font-size: 10px;
            text-align: center;
            color: #555;
            border-top: 1px solid #E4ECFF;
            padding-top: 8px;
        }

        .footer p {
            margin: 2px 0;
        }

        /* ===== CONDITIONS (VERSO) ===== */
        .conditions-list {
            list-style: decimal;
            padding-left: 20px;
        }

        .condition-row {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 12px;
        }

        .cond-fr {
            flex: 1;
            font-size: 13px;
        }

        .cond-ar {
            flex: 1;
            direction: rtl;
            text-align: right;
            font-size: 13px;
            font-family: Tahoma, sans-serif;
        }

        /* Responsive mobile */
        @media (max-width: 600px) {
            .condition-row {
                flex-direction: column;
            }
        }

        /* PRINT A4 */
        @page {
            size: A4;
            margin: 10mm;
        }

        @media print {
            html,
            body {
                margin: 0;
                padding: 0;
                background: #fff !important;
            }

            .contract-page {
                width: 100%;
                max-width: 100%;
                margin: 0;
                border-radius: 0;
                border: none;
                page-break-after: always;
            }

            .contract-page:last-child {
                page-break-after: auto;
            }

            .two-column-table,
            .info-table {
                width: 100%;
                table-layout: fixed;
            }

            .two-column-table th,
            .two-column-table td,
            .info-table td {
                word-wrap: break-word;
                font-size: 10px;
            }
        }
    </style>
</head>
<body>

    <!-- ===== PAGE 1 : RECTO ===== -->
    <div class="contract-page">
        <div class="contract-container">
            <div class="header">
                <div style="display:flex;align-items:center;gap:10px;">
                    ${partnerLogo ? `
                    <div class="logo-container">
                        <img src="${partnerLogo}" alt="Logo ${partnerName}" />
                    </div>` : ''}
                    <div class="company-info">
                        <h1>CONTRAT DE LOCATION DE VÉHICULE</h1>
                        <p><strong>${partnerName}</strong></p>
                        <p>
                            Date de génération :
                            ${new Date().toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
                <div class="contract-number">
                    Contrat N°: ${contract._id}
                </div>
            </div>

            <!-- INFORMATIONS DES PARTIES -->
            <div class="section">
                <h3>INFORMATIONS DES PARTIES</h3>
                <table class="two-column-table">
                    <tr>
                        <th>LOUEUR (Partenaire)</th>
                        <th>LOCATAIRE (Client)</th>
                    </tr>
                    <tr>
                        <td>
                            <table class="info-table">
                                <tr>
                                    <td class="label">Nom entreprise :</td>
                                    <td class="value">${partnerInfo.partnerName || partnerName}</td>
                                </tr>
                                <tr>
                                    <td class="label">Email :</td>
                                    <td class="value">${partnerInfo.partnerEmail || user.email}</td>
                                </tr>
                                <tr>
                                    <td class="label">Téléphone :</td>
                                    <td class="value">${partnerInfo.partnerPhone || user.number || user.telephone || 'Non spécifié'}</td>
                                </tr>
                                <tr>
                                    <td class="label">Pays :</td>
                                    <td class="value">${partnerInfo.partnerCountry || user.country || 'Non spécifié'}</td>
                                </tr>
                                <tr>
                                    <td class="label">Ville :</td>
                                    <td class="value">${partnerInfo.partnerCity || user.city || 'Non spécifié'}</td>
                                </tr>
                            </table>
                        </td>
                        <td>
                            <table class="info-table">
                                <tr>
                                    <td class="label">Nom :</td>
                                    <td class="value">${contract.clientInfo.lastName}</td>
                                </tr>
                                <tr>
                                    <td class="label">Prénom :</td>
                                    <td class="value">${contract.clientInfo.firstName}</td>
                                </tr>
                                <tr>
                                    <td class="label">Date de naissance :</td>
                                    <td class="value">
                                        ${contract.clientInfo.birthDate
                                            ? new Date(contract.clientInfo.birthDate).toLocaleDateString('fr-FR')
                                            : 'Non spécifiée'}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label">Téléphone :</td>
                                    <td class="value">${contract.clientInfo.phone}</td>
                                </tr>
                                <tr>
                                    <td class="label">Adresse :</td>
                                    <td class="value">${contract.clientInfo.address}</td>
                                </tr>
                                <tr>
                                    <td class="label">Passeport :</td>
                                    <td class="value">${contract.clientInfo.passport || 'Non spécifié'}</td>
                                </tr>
                                <tr>
                                    <td class="label">CIN :</td>
                                    <td class="value">${contract.clientInfo.cin || 'Non spécifié'}</td>
                                </tr>
                                <tr>
                                    <td class="label">Permis de conduire :</td>
                                    <td class="value">${contract.clientInfo.licenseNumber}</td>
                                </tr>
                                <tr>
                                    <td class="label">Délivré le :</td>
                                    <td class="value">
                                        ${contract.clientInfo.licenseIssueDate
                                            ? new Date(contract.clientInfo.licenseIssueDate).toLocaleDateString('fr-FR')
                                            : 'Non spécifié'}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- DEUXIÈME CONDUCTEUR -->
            ${contract.secondDriverInfo && (contract.secondDriverInfo.lastName || contract.secondDriverInfo.firstName) ? `
            <div class="section">
                <h3>DEUXIÈME CONDUCTEUR</h3>
                <table class="info-table">
                    <tr>
                        <td class="label">Nom :</td>
                        <td class="value">${contract.secondDriverInfo.lastName}</td>
                    </tr>
                    <tr>
                        <td class="label">Prénom :</td>
                        <td class="value">${contract.secondDriverInfo.firstName}</td>
                    </tr>
                    <tr>
                        <td class="label">Permis de conduire :</td>
                        <td class="value">${contract.secondDriverInfo.licenseNumber || 'Non spécifié'}</td>
                    </tr>
                    <tr>
                        <td class="label">Délivré le :</td>
                        <td class="value">
                            ${contract.secondDriverInfo.licenseIssueDate
                                ? new Date(contract.secondDriverInfo.licenseIssueDate).toLocaleDateString('fr-FR')
                                : 'Non spécifié'}
                        </td>
                    </tr>
                </table>
            </div>` : ''}

            <!-- VÉHICULE LOUÉ -->
            <div class="section">
                <h3>VÉHICULE LOUÉ</h3>

                ${vehicleImage ? `
                <div class="vehicle-image-container">
                    <img src="${vehicleImage}" alt="${vehicleInfo.name}" class="vehicle-image" />
                </div>` : ''}

                ${vehicleInfo ? `
                <table class="info-table">
                    <tr>
                        <td class="label">Véhicule :</td>
                        <td class="value">${vehicleInfo.name}</td>
                    </tr>
                    <tr>
                        <td class="label">Type :</td>
                        <td class="value">${vehicleInfo.type}</td>
                    </tr>
                    <tr>
                        <td class="label">Boîte de vitesse :</td>
                        <td class="value">${vehicleInfo.boiteVitesse}</td>
                    </tr>
                    <tr>
                        <td class="label">Carburant :</td>
                        <td class="value">${vehicleInfo.carburant || 'Non spécifié'}</td>
                    </tr>
                    <tr>
                        <td class="label">Niveau réservoir :</td>
                        <td class="value">${vehicleInfo.niveauReservoir || 'Non spécifié'}</td>
                    </tr>
                    <tr>
                        <td class="label">Kilométrage départ :</td>
                        <td class="value">${vehicleInfo.kmDepart || 'Non spécifié'} km</td>
                    </tr>
                    <tr>
                        <td class="label">Kilométrage retour :</td>
                        <td class="value">${vehicleInfo.kmRetour || 'Non spécifié'} km</td>
                    </tr>
                    <tr>
                        <td class="label">Nombre de clés :</td>
                        <td class="value">${vehicleInfo.nombreCles || 'Non spécifié'}</td>
                    </tr>
                    <tr>
                        <td class="label">Équipements :</td>
                        <td class="value">
                            ${vehicleInfo.radio ? '<span class="equipment-tag"><i class="material-icons">radio</i>Radio</span>' : ''}
                            ${vehicleInfo.gps ? '<span class="equipment-tag"><i class="material-icons">location_on</i>GPS</span>' : ''}
                            ${vehicleInfo.mp3 ? '<span class="equipment-tag"><i class="material-icons">library_music</i>MP3</span>' : ''}
                            ${vehicleInfo.cd ? '<span class="equipment-tag"><i class="material-icons">album</i>CD</span>' : ''}
                            ${!vehicleInfo.radio && !vehicleInfo.gps && !vehicleInfo.mp3 && !vehicleInfo.cd ? 'Aucun équipement spécifié' : ''}
                        </td>
                    </tr>
                    <tr>
                        <td class="label">Prix par jour :</td>
                        <td class="value">${contract.rentalInfo.prixParJour || vehicleInfo.pricePerDay} DH</td>
                    </tr>
                    ${vehicleInfo.description ? `
                    <tr>
                        <td class="label">Description :</td>
                        <td class="value">${vehicleInfo.description}</td>
                    </tr>` : ''}
                    ${vehicleInfo.remarques ? `
                    <tr>
                        <td class="label">Remarques :</td>
                        <td class="value">${vehicleInfo.remarques}</td>
                    </tr>` : ''}
                    ${vehicleInfo.dommages && vehicleInfo.dommages.length > 0 ? `
                    <tr>
                        <td class="label">Dommages existants :</td>
                        <td class="value">
                            <div class="damages-list">
                                ${vehicleInfo.dommages.map(damage => `
                                    <span class="damage-tag">${damage}</span>
                                `).join('')}
                            </div>
                        </td>
                    </tr>` : ''}
                    ${vehicleInfo.assuranceStartDate && vehicleInfo.assuranceEndDate ? `
                    <tr>
                        <td class="label">Assurance :</td>
                        <td class="value">
                            Du ${new Date(vehicleInfo.assuranceStartDate).toLocaleDateString('fr-FR')}
                            au ${new Date(vehicleInfo.assuranceEndDate).toLocaleDateString('fr-FR')}
                        </td>
                    </tr>` : ''}
                </table>` : '<p>Informations véhicule non disponibles</p>'}
            </div>

            <!-- DÉTAILS DE LA LOCATION -->
            <div class="section">
                <h3>DÉTAILS DE LA LOCATION</h3>
                <table class="info-table">
                    <tr>
                        <td class="label">Date et heure de départ :</td>
                        <td class="value">${formatDate(contract.rentalInfo.startDateTime)}</td>
                    </tr>
                    <tr>
                        <td class="label">Date et heure de retour :</td>
                        <td class="value">${formatDate(contract.rentalInfo.endDateTime)}</td>
                    </tr>
                    <tr>
                        <td class="label">Lieu de départ :</td>
                        <td class="value">${contract.rentalInfo.startLocation}</td>
                    </tr>
                    <tr>
                        <td class="label">Lieu de retour :</td>
                        <td class="value">${contract.rentalInfo.endLocation}</td>
                    </tr>
                    <tr>
                        <td class="label">Durée totale :</td>
                        <td class="value">${contract.rentalInfo.rentalDays} jours</td>
                    </tr>
                    <tr>
                        <td class="label">Prix par jour :</td>
                        <td class="value">${contract.rentalInfo.prixParJour} DH</td>
                    </tr>
                    <tr>
                        <td class="label">Prix total :</td>
                        <td class="value">
                            <span class="total-price">${contract.rentalInfo.prixTotal} DH</span>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- SIGNATURES -->
            <div class="signature">
                <div class="signature-box">
                    <p style="font-weight:600;margin-bottom:8px;">SIGNATURE DU CLIENT</p>
                    <p style="margin-bottom:16px;">
                        ${contract.clientInfo.firstName} ${contract.clientInfo.lastName}
                    </p>
                    <p style="color:#555;font-size:11px;">
                        CIN : ${contract.clientInfo.cin || 'Non spécifié'}
                    </p>
                </div>
                <div class="signature-box">
                    <p style="font-weight:600;margin-bottom:8px;">SIGNATURE DU PARTENAIRE</p>
                    <p style="margin-bottom:16px;">${partnerName}</p>
                    <p style="color:#555;font-size:11px;">
                        Entreprise : ${partnerName}
                    </p>
                </div>
            </div>

            <div class="footer">
                <p>
                    Contrat généré par <strong>WegoRent</strong> - ${partnerName} -
                    ${new Date().toLocaleDateString('fr-FR')}
                </p>
                <p>Pour toute réclamation, contactez : ${user.email}</p>
                <p style="margin-top:4px;font-size:9px;">
                    Ce document a une valeur contractuelle. Conservez-le précieusement.
                </p>
            </div>
        </div>
    </div>

    <!-- ===== PAGE 2 : VERSO (CONDITIONS GÉNÉRALES) ===== -->
    <div class="contract-page">
        <div class="contract-container">
            <div class="header">
                <div class="company-info">
                    <h1>CONDITIONS GÉNÉRALES DE LOCATION</h1>
                    <p><strong>${partnerName}</strong></p>
                    <p>Contrat N°: ${contract._id}</p>
                </div>
            </div>

            <div class="section">
                <h3>CONDITIONS GÉNÉRALES</h3>

                <ol class="conditions-list">
                    <li class="condition-row">
                        <span class="cond-fr">1. Le client doit rendre la voiture dans le même état qu’au départ.</span>
                        <span class="cond-ar">يجب على الزبون إرجاع السيارة بنفس الحالة التي استلمها بها.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">2. Tout dommage non déclaré au départ sera à la charge du client.</span>
                        <span class="cond-ar">أي ضرر غير مصرح به عند الاستلام يكون على عاتق الزبون.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">3. Le carburant est à la charge du client pendant toute la durée de location.</span>
                        <span class="cond-ar">الوقود يكون على حساب الزبون طوال مدة الكراء.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">4. En cas de retard, une pénalité sera appliquée selon les tarifs du loueur.</span>
                        <span class="cond-ar">في حالة التأخير، تُطبق غرامة حسب تعريفات الوكالة.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">5. Le véhicule doit être rendu avec le même niveau de carburant qu’au départ.</span>
                        <span class="cond-ar">يجب إرجاع السيارة بنفس مستوى الوقود عند الاستلام.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">6. Il est interdit de fumer dans le véhicule.</span>
                        <span class="cond-ar">ممنوع التدخين داخل السيارة.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">7. Le client doit présenter un permis de conduire valide et une pièce d’identité.</span>
                        <span class="cond-ar">يجب على الزبون تقديم رخصة سياقة سارية وبطاقة هوية.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">8. Une caution est obligatoire et restituée après vérification du véhicule.</span>
                        <span class="cond-ar">الوديعة إلزامية ويتم إرجاعها بعد فحص السيارة.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">9. Le client est responsable des amendes et infractions pendant la location.</span>
                        <span class="cond-ar">الزبون مسؤول عن جميع المخالفات والغرامات خلال مدة الكراء.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">10. Il est interdit de sortir le véhicule du Maroc sans autorisation écrite.</span>
                        <span class="cond-ar">يمنع استعمال السيارة خارج التراب المغربي بدون إذن كتابي.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">11. En cas d’accident, le client doit prévenir immédiatement la police et le loueur.</span>
                        <span class="cond-ar">في حالة حادث، يجب إبلاغ الشرطة والوكالة فوراً.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">12. Le client ne peut pas sous-louer ou prêter le véhicule à une autre personne.</span>
                        <span class="cond-ar">يمنع على الزبون إعادة كراء السيارة أو إعارتها لشخص آخر.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">13. Le client doit respecter le Code de la route marocain.</span>
                        <span class="cond-ar">يجب احترام قوانين السير في المغرب.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">14. Toute perte de clé ou document du véhicule sera facturée au client.</span>
                        <span class="cond-ar">ضياع مفاتيح السيارة أو وثائقها يكون على حساب الزبون.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">15. Le véhicule doit être utilisé uniquement pour un usage normal et légal.</span>
                        <span class="cond-ar">يجب استعمال السيارة فقط في الاستعمال القانوني والعادي.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">16. Les équipements supplémentaires sont disponibles sur demande.</span>
                        <span class="cond-ar">المعدات الإضافية متوفرة عند الطلب.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">17. Les pneus, jantes ou vitres cassés sont à la charge du client sauf assurance spéciale.</span>
                        <span class="cond-ar">العجلات أو الزجاج المكسور يكون على حساب الزبون ما لم توجد تأمينات إضافية.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">18. Toute réparation non autorisée est interdite.</span>
                        <span class="cond-ar">يمنع القيام بأي إصلاح دون إذن من الوكالة.</span>
                    </li>

                    <li class="condition-row">
                        <span class="cond-fr">19. Le client doit vérifier régulièrement l’huile et l’eau du moteur.</span>
                        <span class="cond-ar">يجب على الزبون مراقبة مستوى الزيت والماء في المحرك بانتظام.</span>
                    </li>

                    
                </ol>
            </div>
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

