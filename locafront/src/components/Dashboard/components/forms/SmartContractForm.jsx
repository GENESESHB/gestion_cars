// components/forms/SmartContractForm.jsx
import React from 'react';

const SmartContractForm = ({
  smartContractForm,
  vehicles,
  clients,
  errors,
  loading,
  isEditing,
  handleSmartContractChange,
  createSmartContract,
  updateSmartContract,
  setShowForm,
  setSmartContractForm,
  setErrors,
  onCancel
}) => {
  const handleSubmit = (e) => {
    if (isEditing) {
      updateSmartContract(e);
    } else {
      createSmartContract(e);
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

  return (
    <div className="contract-form-container">
      <div className="form-header">
        <h2>{isEditing ? 'Modifier le Smart Contrat' : 'Nouveau Smart Contrat'}</h2>
        <p>Créer un contrat intelligent avec exécution automatique</p>
      </div>

      <form onSubmit={handleSubmit} className="contract-form">
        {/* Client Selection */}
        <div className="form-section">
          <h3>👤 Sélection du Client</h3>
          <div className="form-group">
            <label>Client *</label>
            <select
              name="clientId"
              value={smartContractForm.clientId}
              onChange={handleSmartContractChange}
              className={errors.clientId ? 'error' : ''}
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>
                  {client.firstName} {client.lastName} - {client.phone} - {client.cin || client.passport || 'No ID'}
                </option>
              ))}
            </select>
            {errors.clientId && <span className="error-text">{errors.clientId}</span>}
          </div>
        </div>

        {/* Second Driver Information */}
        <div className="form-section">
          <h3>👥 Informations du Deuxième Conducteur</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Nom du 2ème Conducteur:</label>
              <input
                type="text"
                name="secondDriverLastName"
                value={smartContractForm.secondDriverLastName}
                onChange={handleSmartContractChange}
                placeholder="Nom"
                className={errors.secondDriverLastName ? 'error' : ''}
              />
              {errors.secondDriverLastName && <span className="error-text">{errors.secondDriverLastName}</span>}
            </div>

            <div className="form-group">
              <label>Prénom du 2ème Conducteur:</label>
              <input
                type="text"
                name="secondDriverFirstName"
                value={smartContractForm.secondDriverFirstName}
                onChange={handleSmartContractChange}
                placeholder="Prénom"
                className={errors.secondDriverFirstName ? 'error' : ''}
              />
              {errors.secondDriverFirstName && <span className="error-text">{errors.secondDriverFirstName}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Permis de Conduire N°:</label>
              <input
                type="text"
                name="secondDriverLicenseNumber"
                value={smartContractForm.secondDriverLicenseNumber}
                onChange={handleSmartContractChange}
                placeholder="Numéro de permis"
                className={errors.secondDriverLicenseNumber ? 'error' : ''}
              />
              {errors.secondDriverLicenseNumber && <span className="error-text">{errors.secondDriverLicenseNumber}</span>}
            </div>

            <div className="form-group">
              <label>Délivré le:</label>
              <input
                type="date"
                name="secondDriverLicenseIssueDate"
                value={smartContractForm.secondDriverLicenseIssueDate}
                onChange={handleSmartContractChange}
                className={errors.secondDriverLicenseIssueDate ? 'error' : ''}
              />
              {errors.secondDriverLicenseIssueDate && <span className="error-text">{errors.secondDriverLicenseIssueDate}</span>}
            </div>
          </div>
        </div>

        {/* Vehicle Selection */}
        <div className="form-section">
          <h3>🚗 Sélection du Véhicule</h3>
          <div className="form-group">
            <label>Véhicule:</label>
            <select
              name="vehicleId"
              value={smartContractForm.vehicleId}
              onChange={handleSmartContractChange}
              className={errors.vehicleId ? 'error' : ''}
              required
            >
              <option value="">Sélectionnez un véhicule</option>
              {vehicles
                .filter(vehicle => vehicle.available)
                .map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.name} - {vehicle.type} - {vehicle.pricePerDay} DH/jour
                </option>
              ))}
            </select>
            {errors.vehicleId && <span className="error-text">{errors.vehicleId}</span>}
          </div>
        </div>

        {/* Price Configuration */}
        <div className="form-section">
          <h3>💰 Configuration du Prix</h3>
          <div className="form-group">
            <label>Prix par Jour (DH):</label>
            <input
              type="number"
              name="prixParJour"
              value={smartContractForm.prixParJour}
              onChange={handleSmartContractChange}
              onBlur={calculateTotalPrice}
              placeholder="Sélectionnez un véhicule"
              className={errors.prixParJour ? 'error' : ''}
              required
            />
            {errors.prixParJour && <span className="error-text">{errors.prixParJour}</span>}
          </div>
        </div>

        {/* Rental Period and Locations */}
        <div className="form-section">
          <h3>📅 Période et Lieux de Location</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Date et Heure de Départ:</label>
              <input
                type="datetime-local"
                name="startDateTime"
                value={smartContractForm.startDateTime}
                onChange={handleSmartContractChange}
                className={errors.startDateTime ? 'error' : ''}
                required
              />
              {errors.startDateTime && <span className="error-text">{errors.startDateTime}</span>}
            </div>

            <div className="form-group">
              <label>Date et Heure de Retour:</label>
              <input
                type="datetime-local"
                name="endDateTime"
                value={smartContractForm.endDateTime}
                onChange={handleSmartContractChange}
                className={errors.endDateTime ? 'error' : ''}
                required
              />
              {errors.endDateTime && <span className="error-text">{errors.endDateTime}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Lieu de Départ:</label>
              <input
                type="text"
                name="startLocation"
                value={smartContractForm.startLocation}
                onChange={handleSmartContractChange}
                placeholder="Lieu de Départ"
                className={errors.startLocation ? 'error' : ''}
                required
              />
              {errors.startLocation && <span className="error-text">{errors.startLocation}</span>}
            </div>

            <div className="form-group">
              <label>Lieu de Retour:</label>
              <input
                type="text"
                name="endLocation"
                value={smartContractForm.endLocation}
                onChange={handleSmartContractChange}
                placeholder="Lieu de Retour"
                className={errors.endLocation ? 'error' : ''}
                required
              />
              {errors.endLocation && <span className="error-text">{errors.endLocation}</span>}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Traitement...' : (isEditing ? '💾 Mettre à jour' : '⚡ Créer le Smart Contrat')}
          </button>
        </div>
      </form>

      <style jsx>{`
        .contract-form-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .form-header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #f0f0f0;
        }

        .form-header h2 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 24px;
        }

        .form-header p {
          margin: 0;
          color: #7f8c8d;
          font-size: 14px;
        }

        .form-section {
          margin-bottom: 32px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #ff6b35;
        }

        .form-section h3 {
          margin: 0 0 16px 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #2c3e50;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
          background: white;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .form-group input.error,
        .form-group select.error,
        .form-group textarea.error {
          border-color: #e74c3c;
        }

        .form-group input.readonly {
          background-color: #f8f9fa;
          color: #6c757d;
          cursor: not-allowed;
        }

        .error-text {
          color: #e74c3c;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          color: #6c757d;
          font-size: 12px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid #e1e8ed;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #ff6b35;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #e55a2b;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
        }

        .btn-primary:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #3498db;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #2980b9;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .btn-secondary:disabled {
          background: #bdc3c7;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .contract-form-container {
            padding: 16px;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default SmartContractForm;
