// components/SmartContractsManagement.jsx
import React, { useState } from 'react';
import api from '../../../utils/api';
import SmartContractForm from './forms/SmartContractForm';
import SmartContractsList from './lists/SmartContractsList';

const SmartContractsManagement = ({
  user,
  vehicles,
  clients,
  smartContracts,
  setSmartContracts,
  setMessage,
  loadSmartContracts
}) => {
  const [smartContractForm, setSmartContractForm] = useState({
    // Client selection (from existing clients)
    clientId: '',

    // Second driver information
    secondDriverLastName: '',
    secondDriverFirstName: '',
    secondDriverLicenseNumber: '',
    secondDriverLicenseIssueDate: '',

    // Vehicle selection
    vehicleId: '',

    // Contract terms
    startDateTime: '',
    endDateTime: '',
    startLocation: '',
    endLocation: '',
    prixParJour: '',
    prixTotal: 0,

    // Smart contract specific fields
    contractType: 'automatic', // automatic, semi-automatic, manual
    paymentTerms: 'prepaid', // prepaid, postpaid, installment
    penaltyRate: 0, // Percentage for late returns
    depositAmount: 0,
    automaticRenewal: false,
    termsAndConditions: '',

    // Blockchain specific (if applicable)
    blockchainNetwork: 'ethereum', // ethereum, polygon, binance
    tokenStandard: 'ERC20', // ERC20, ERC721, etc.
    smartContractAddress: '', // Auto-generated or manual
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingContract, setEditingContract] = useState(null);

  const handleSmartContractChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSmartContractForm({
      ...smartContractForm,
      [name]: type === 'checkbox' ? checked : value
    });
    setErrors({ ...errors, [name]: '' });

    // Auto-fill client details when client is selected
    if (name === 'clientId' && value) {
      const selectedClient = clients.find(client => client._id === value);
      if (selectedClient) {
        console.log('✅ Client sélectionné:', selectedClient);
      }
    }

    // Auto-fill vehicle price when vehicle is selected
    if (name === 'vehicleId' && value) {
      const selectedVehicle = vehicles.find(vehicle => vehicle._id === value);
      if (selectedVehicle && selectedVehicle.pricePerDay) {
        setSmartContractForm(prev => ({
          ...prev,
          prixParJour: selectedVehicle.pricePerDay
        }));
      }
    }

    // Calculate total price when dates or daily price change
    if ((name === 'startDateTime' || name === 'endDateTime' || name === 'prixParJour') &&
        smartContractForm.startDateTime && smartContractForm.endDateTime && smartContractForm.prixParJour) {
      calculateTotalPrice();
    }
  };

  const calculateTotalPrice = () => {
    const start = new Date(smartContractForm.startDateTime);
    const end = new Date(smartContractForm.endDateTime);

    if (start && end && !isNaN(start) && !isNaN(end)) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const rentalDays = diffDays === 0 ? 1 : diffDays;
      const prixTotal = rentalDays * (parseFloat(smartContractForm.prixParJour) || 0);

      setSmartContractForm(prev => ({
        ...prev,
        prixTotal: prixTotal
      }));
    }
  };

  const checkBlacklist = async (clientId) => {
    try {
      const selectedClient = clients.find(client => client._id === clientId);
      if (!selectedClient) return false;

      const response = await api.get('/blacklist/check', {
        params: {
          cin: selectedClient.cin,
          passport: selectedClient.passport
        }
      });
      return response.data.isBlacklisted;
    } catch (error) {
      console.error('Error checking blacklist:', error);
      return false;
    }
  };

  const createSmartContract = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!smartContractForm.clientId || !smartContractForm.vehicleId ||
        !smartContractForm.startDateTime || !smartContractForm.endDateTime ||
        !smartContractForm.startLocation || !smartContractForm.endLocation) {
      setMessage('❌ Veuillez remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    try {
      // Check blacklist
      const isBlacklisted = await checkBlacklist(smartContractForm.clientId);
      if (isBlacklisted) {
        setMessage('❌ Ce client est dans la liste noire! Contrat non autorisé.');
        setLoading(false);
        return;
      }

      // Get selected client and vehicle details
      const selectedClient = clients.find(client => client._id === smartContractForm.clientId);
      const selectedVehicle = vehicles.find(vehicle => vehicle._id === smartContractForm.vehicleId);

      if (!selectedClient || !selectedVehicle) {
        setMessage('❌ Client ou véhicule non trouvé.');
        setLoading(false);
        return;
      }

      // Calculate rental days and total price
      const start = new Date(smartContractForm.startDateTime);
      const end = new Date(smartContractForm.endDateTime);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const rentalDays = diffDays === 0 ? 1 : diffDays;
      const prixTotal = rentalDays * (parseFloat(smartContractForm.prixParJour) || selectedVehicle.pricePerDay);

      // Create smart contract data
      const smartContractData = {
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

        // 2. Client information (from selected client)
        clientInfo: {
          clientId: selectedClient._id,
          lastName: selectedClient.lastName,
          firstName: selectedClient.firstName,
          birthDate: selectedClient.birthDate,
          phone: selectedClient.phone,
          address: selectedClient.address,
          passport: selectedClient.passport,
          cin: selectedClient.cin,
          licenseNumber: selectedClient.licenseNumber,
          licenseIssueDate: selectedClient.licenseIssueDate,
          email: selectedClient.email
        },

        // Second driver information
        secondDriverInfo: {
          lastName: smartContractForm.secondDriverLastName,
          firstName: smartContractForm.secondDriverFirstName,
          licenseNumber: smartContractForm.secondDriverLicenseNumber,
          licenseIssueDate: smartContractForm.secondDriverLicenseIssueDate
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
          startDateTime: smartContractForm.startDateTime,
          endDateTime: smartContractForm.endDateTime,
          startLocation: smartContractForm.startLocation,
          endLocation: smartContractForm.endLocation,
          prixParJour: smartContractForm.prixParJour || selectedVehicle.pricePerDay,
          prixTotal: prixTotal,
          rentalDays: rentalDays
        },

        // Smart contract specific information
        smartContractTerms: {
          contractType: smartContractForm.contractType,
          paymentTerms: smartContractForm.paymentTerms,
          penaltyRate: parseFloat(smartContractForm.penaltyRate) || 0,
          depositAmount: parseFloat(smartContractForm.depositAmount) || 0,
          automaticRenewal: smartContractForm.automaticRenewal,
          termsAndConditions: smartContractForm.termsAndConditions,
          blockchainNetwork: smartContractForm.blockchainNetwork,
          tokenStandard: smartContractForm.tokenStandard,
          smartContractAddress: smartContractForm.smartContractAddress || `SC-${Date.now()}`,
          status: 'active', // active, executed, cancelled, expired
          isAutomated: true
        },

        // Contract metadata
        contractMetadata: {
          createdBy: user._id || user.id,
          createdAt: new Date().toISOString(),
          status: 'pending'
        }
      };

      console.log('📤 Données smart contract envoyées:', smartContractData);
      console.log('👤 COMPLETE Informations utilisateur:', user);
      console.log('🚗 Véhicule sélectionné:', selectedVehicle);

      // Send complete contract data to server
      const res = await api.post('/contracts', smartContractData);

      console.log('✅ Réponse du serveur:', res.data);

      // Reset form
      setSmartContractForm({
        clientId: '',
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
        prixTotal: 0,
        contractType: 'automatic',
        paymentTerms: 'prepaid',
        penaltyRate: 0,
        depositAmount: 0,
        automaticRenewal: false,
        termsAndConditions: '',
        blockchainNetwork: 'ethereum',
        tokenStandard: 'ERC20',
        smartContractAddress: ''
      });
      setShowForm(false);
      setErrors({});

      // Reload smart contracts
      await loadSmartContracts();

      setMessage('✅ Smart contrat créé avec succès! Toutes les informations ont été sauvegardées.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('❌ Erreur création smart contrat:', err);
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
        setMessage('❌ Erreur lors de la création du smart contrat: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSmartContract = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get selected client and vehicle details
      const selectedClient = clients.find(client => client._id === smartContractForm.clientId);
      const selectedVehicle = vehicles.find(vehicle => vehicle._id === smartContractForm.vehicleId);

      if (!selectedClient || !selectedVehicle) {
        setMessage('❌ Client ou véhicule non trouvé.');
        setLoading(false);
        return;
      }

      // Calculate total price
      const start = new Date(smartContractForm.startDateTime);
      const end = new Date(smartContractForm.endDateTime);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const rentalDays = diffDays === 0 ? 1 : diffDays;
      const prixTotal = rentalDays * (parseFloat(smartContractForm.prixParJour) || selectedVehicle.pricePerDay);

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
          clientId: selectedClient._id,
          lastName: selectedClient.lastName,
          firstName: selectedClient.firstName,
          birthDate: selectedClient.birthDate,
          phone: selectedClient.phone,
          address: selectedClient.address,
          passport: selectedClient.passport,
          cin: selectedClient.cin,
          licenseNumber: selectedClient.licenseNumber,
          licenseIssueDate: selectedClient.licenseIssueDate,
          email: selectedClient.email
        },

        // Second driver information
        secondDriverInfo: {
          lastName: smartContractForm.secondDriverLastName,
          firstName: smartContractForm.secondDriverFirstName,
          licenseNumber: smartContractForm.secondDriverLicenseNumber,
          licenseIssueDate: smartContractForm.secondDriverLicenseIssueDate
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
          startDateTime: smartContractForm.startDateTime,
          endDateTime: smartContractForm.endDateTime,
          startLocation: smartContractForm.startLocation,
          endLocation: smartContractForm.endLocation,
          prixParJour: smartContractForm.prixParJour || selectedVehicle.pricePerDay,
          prixTotal: prixTotal,
          rentalDays: rentalDays
        },

        // Smart contract specific information
        smartContractTerms: {
          contractType: smartContractForm.contractType,
          paymentTerms: smartContractForm.paymentTerms,
          penaltyRate: parseFloat(smartContractForm.penaltyRate) || 0,
          depositAmount: parseFloat(smartContractForm.depositAmount) || 0,
          automaticRenewal: smartContractForm.automaticRenewal,
          termsAndConditions: smartContractForm.termsAndConditions,
          blockchainNetwork: smartContractForm.blockchainNetwork,
          tokenStandard: smartContractForm.tokenStandard,
          smartContractAddress: smartContractForm.smartContractAddress
        },

        // Status
        status: smartContractForm.status || 'pending'
      };

      console.log('📤 Mise à jour complète du smart contrat:', contractData);

      const res = await api.put(`/contracts/${editingContract._id}`, contractData);

      // Reset form
      setSmartContractForm({
        clientId: '',
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
        prixTotal: 0,
        contractType: 'automatic',
        paymentTerms: 'prepaid',
        penaltyRate: 0,
        depositAmount: 0,
        automaticRenewal: false,
        termsAndConditions: '',
        blockchainNetwork: 'ethereum',
        tokenStandard: 'ERC20',
        smartContractAddress: ''
      });
      setShowForm(false);
      setEditingContract(null);
      setErrors({});

      // Reload smart contracts
      await loadSmartContracts();

      setMessage('✅ Smart contrat modifié avec succès! Toutes les informations ont été mises à jour.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      console.error('❌ Erreur modification smart contrat:', err);
      console.error('Détails erreur:', err.response?.data);
      setMessage('❌ Erreur lors de la modification du smart contrat: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const deleteSmartContract = async (contractId) => {
    try {
      await api.delete(`/contracts/${contractId}`);

      // Update local state
      setSmartContracts(smartContracts.filter(contract => contract._id !== contractId));

      setMessage('✅ Smart contrat supprimé avec succès!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur suppression smart contrat:', err);
      setMessage('❌ Erreur lors de la suppression du smart contrat: ' + (err.response?.data?.message || err.message));
    }
  };

  const updateSmartContractStatus = async (contractId, status) => {
    try {
      await api.patch(`/contracts/${contractId}`, { status });

      // Update local state
      setSmartContracts(smartContracts.map(contract =>
        contract._id === contractId ? { ...contract, status } : contract
      ));

      setMessage(`✅ Statut du smart contrat mis à jour: ${status}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur changement statut smart contrat:', err);
      setMessage('❌ Erreur lors du changement de statut: ' + (err.response?.data?.message || err.message));
    }
  };

  const executeSmartContract = async (contractId) => {
    try {
      await api.post(`/contracts/${contractId}/execute`);

      // Update local state
      setSmartContracts(smartContracts.map(contract =>
        contract._id === contractId ? { ...contract, status: 'executed' } : contract
      ));

      setMessage('✅ Smart contrat exécuté avec succès!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('❌ Erreur exécution smart contrat:', err);
      setMessage('❌ Erreur lors de l\'exécution du smart contrat: ' + (err.response?.data?.message || err.message));
    }
  };

  const downloadSmartContract = (contract) => {
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
    // Use smart contract terms
    const smartContractTerms = contract.smartContractTerms ? contract.smartContractTerms : {};

    // Get vehicle image
    const vehicleImage = vehicleInfo?.image || '';

    contractWindow.document.write(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Contrat de Location - ${contract.clientInfo.firstName} ${contract.clientInfo.lastName}</title>
    <style>
        /* ... (same CSS as in ContractsManagement but with purple theme for smart contracts) ... */
    </style>
</head>
<body>
    <div class="contract-container">
        <!-- ... (same HTML structure as ContractsManagement but with smart contract specific sections) ... -->
    </div>
</body>
</html>
    `);
    contractWindow.document.close();
    contractWindow.print();
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    setSmartContractForm({
      clientId: contract.clientInfo?.clientId || '',
      secondDriverLastName: contract.secondDriverInfo?.lastName || '',
      secondDriverFirstName: contract.secondDriverInfo?.firstName || '',
      secondDriverLicenseNumber: contract.secondDriverInfo?.licenseNumber || '',
      secondDriverLicenseIssueDate: contract.secondDriverInfo?.licenseIssueDate ? contract.secondDriverInfo.licenseIssueDate.split('T')[0] : '',
      vehicleId: contract.vehicleInfo?.vehicleId || '',
      startDateTime: contract.rentalInfo?.startDateTime ? contract.rentalInfo.startDateTime.slice(0, 16) : '',
      endDateTime: contract.rentalInfo?.endDateTime ? contract.rentalInfo.endDateTime.slice(0, 16) : '',
      startLocation: contract.rentalInfo?.startLocation || '',
      endLocation: contract.rentalInfo?.endLocation || '',
      prixParJour: contract.rentalInfo?.prixParJour || '',
      prixTotal: contract.rentalInfo?.prixTotal || 0,
      contractType: contract.smartContractTerms?.contractType || 'automatic',
      paymentTerms: contract.smartContractTerms?.paymentTerms || 'prepaid',
      penaltyRate: contract.smartContractTerms?.penaltyRate || 0,
      depositAmount: contract.smartContractTerms?.depositAmount || 0,
      automaticRenewal: contract.smartContractTerms?.automaticRenewal || false,
      termsAndConditions: contract.smartContractTerms?.termsAndConditions || '',
      blockchainNetwork: contract.smartContractTerms?.blockchainNetwork || 'ethereum',
      tokenStandard: contract.smartContractTerms?.tokenStandard || 'ERC20',
      smartContractAddress: contract.smartContractTerms?.smartContractAddress || ''
    });
    setShowForm(true);
    setErrors({});
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContract(null);
    setSmartContractForm({
      clientId: '',
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
      prixTotal: 0,
      contractType: 'automatic',
      paymentTerms: 'prepaid',
      penaltyRate: 0,
      depositAmount: 0,
      automaticRenewal: false,
      termsAndConditions: '',
      blockchainNetwork: 'ethereum',
      tokenStandard: 'ERC20',
      smartContractAddress: ''
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
            className="add-smart-contract-btn"
            style={{
              padding: '12px 24px',
              backgroundColor: '#8e44ad',
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
              e.target.style.backgroundColor = '#732d91';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.backgroundColor = '#8e44ad';
            }}
          >
            ⚡ Créer un Smart Contrat
          </button>
        </div>
        <SmartContractsList
          smartContracts={smartContracts}
          vehicles={vehicles}
          clients={clients}
          onEdit={handleEdit}
          onDelete={deleteSmartContract}
          onUpdateStatus={updateSmartContractStatus}
          onExecute={executeSmartContract}
          onDownload={downloadSmartContract}
        />
      </div>
    );
  }

  return (
    <div>
      <SmartContractForm
        smartContractForm={smartContractForm}
        vehicles={vehicles}
        clients={clients}
        errors={errors}
        loading={loading}
        isEditing={!!editingContract}
        handleSmartContractChange={handleSmartContractChange}
        createSmartContract={createSmartContract}
        updateSmartContract={updateSmartContract}
        setShowForm={setShowForm}
        setSmartContractForm={setSmartContractForm}
        setErrors={setErrors}
        onCancel={handleCancel}
      />
      <SmartContractsList
        smartContracts={smartContracts}
        vehicles={vehicles}
        clients={clients}
        onEdit={handleEdit}
        onDelete={deleteSmartContract}
        onUpdateStatus={updateSmartContractStatus}
        onExecute={executeSmartContract}
        onDownload={downloadSmartContract}
      />
    </div>
  );
};

export default SmartContractsManagement;
