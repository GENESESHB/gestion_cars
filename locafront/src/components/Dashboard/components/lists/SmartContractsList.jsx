// components/lists/SmartContractsList.jsx
import React, { useState } from 'react';

const SmartContractsList = ({
  smartContracts,
  vehicles,
  clients,
  onEdit,
  onDelete,
  onUpdateStatus,
  onExecute
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredContracts = smartContracts.filter(contract => {
    const matchesFilter = filter === 'all' || contract.smartContractTerms?.status === filter;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      contract.clientInfo?.firstName?.toLowerCase().includes(searchLower) ||
      contract.clientInfo?.lastName?.toLowerCase().includes(searchLower) ||
      contract.vehicleInfo?.name?.toLowerCase().includes(searchLower) ||
      contract.smartContractTerms?.smartContractAddress?.toLowerCase().includes(searchLower) ||
      contract._id?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: '#10b981', label: 'Actif' },
      executed: { color: '#3b82f6', label: 'Exécuté' },
      cancelled: { color: '#ef4444', label: 'Annulé' },
      expired: { color: '#6b7280', label: 'Expiré' },
      pending: { color: '#f59e0b', label: 'En attente' }
    };

    const config = statusConfig[status] || { color: '#6b7280', label: status };
    
    return (
      <span
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          border: `1px solid ${config.color}40`
        }}
      >
        {config.label}
      </span>
    );
  };

  const getContractTypeBadge = (type) => {
    const typeConfig = {
      automatic: { color: '#8b5cf6', label: 'Auto', icon: '⚡' },
      'semi-automatic': { color: '#06b6d4', label: 'Semi-Auto', icon: '🔧' },
      manual: { color: '#f59e0b', label: 'Manuel', icon: '👤' }
    };

    const config = typeConfig[type] || { color: '#6b7280', label: type, icon: '❓' };
    
    return (
      <span
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {config.icon} {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateAddress = (address) => {
    if (!address) return 'Non défini';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (smartContracts.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px', 
        background: 'white', 
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
        <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Aucun Smart Contrat</h3>
        <p style={{ color: '#9ca3af' }}>Créez votre premier smart contrat pour commencer</p>
      </div>
    );
  }

  return (
    <div className="contracts-list-container">
      {/* Filters and Search */}
      <div className="list-header">
        <div className="filters">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="executed">Exécutés</option>
            <option value="pending">En attente</option>
            <option value="cancelled">Annulés</option>
            <option value="expired">Expirés</option>
          </select>

          <input
            type="text"
            placeholder="Rechercher un contrat, client, véhicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="stats">
          <span>{filteredContracts.length} contrat(s) trouvé(s)</span>
        </div>
      </div>

      {/* Contracts Grid */}
      <div className="contracts-grid">
        {filteredContracts.map(contract => (
          <div key={contract._id} className="contract-card">
            {/* Card Header */}
            <div className="card-header">
              <div className="header-left">
                <h4>Smart Contrat #{contract._id.slice(-8)}</h4>
                <div className="badges">
                  {getStatusBadge(contract.smartContractTerms?.status)}
                  {getContractTypeBadge(contract.smartContractTerms?.contractType)}
                </div>
              </div>
              <div className="header-right">
                <span className="contract-date">
                  {formatDate(contract.contractMetadata?.createdAt)}
                </span>
              </div>
            </div>

            {/* Contract Details */}
            <div className="card-body">
              {/* Client Information */}
              <div className="info-section">
                <div className="info-label">👤 Client</div>
                <div className="info-value">
                  {contract.clientInfo?.firstName} {contract.clientInfo?.lastName}
                </div>
                <div className="info-sub">
                  {contract.clientInfo?.phone} • {contract.clientInfo?.cin || contract.clientInfo?.passport || 'No ID'}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="info-section">
                <div className="info-label">🚗 Véhicule</div>
                <div className="info-value">{contract.vehicleInfo?.name}</div>
                <div className="info-sub">
                  {contract.vehicleInfo?.type} • {contract.rentalInfo?.prixParJour} DH/jour
                </div>
              </div>

              {/* Rental Period */}
              <div className="info-section">
                <div className="info-label">📅 Période</div>
                <div className="info-value">
                  {formatDate(contract.rentalInfo?.startDateTime)} → {formatDate(contract.rentalInfo?.endDateTime)}
                </div>
                <div className="info-sub">
                  {contract.rentalInfo?.rentalDays} jour(s) • {contract.rentalInfo?.prixTotal} DH total
                </div>
              </div>

              {/* Smart Contract Details */}
              <div className="info-section">
                <div className="info-label">⚡ Smart Contract</div>
                <div className="info-value">
                  {truncateAddress(contract.smartContractTerms?.smartContractAddress)}
                </div>
                <div className="info-sub">
                  {contract.smartContractTerms?.blockchainNetwork} • {contract.smartContractTerms?.tokenStandard}
                  {contract.smartContractTerms?.automaticRenewal && ' • 🔄 Auto-renew'}
                </div>
              </div>

              {/* Financial Details */}
              <div className="financial-details">
                <div className="financial-item">
                  <span>Pénalité:</span>
                  <span>{contract.smartContractTerms?.penaltyRate || 0}%</span>
                </div>
                <div className="financial-item">
                  <span>Dépôt:</span>
                  <span>{contract.smartContractTerms?.depositAmount || 0} DH</span>
                </div>
              </div>
            </div>

            {/* Card Actions */}
            <div className="card-actions">
              <button
                onClick={() => onEdit(contract)}
                className="btn-action edit"
                title="Modifier"
              >
                ✏️ Modifier
              </button>

              {contract.smartContractTerms?.status === 'active' && (
                <button
                  onClick={() => onExecute(contract._id)}
                  className="btn-action execute"
                  title="Exécuter"
                >
                  ⚡ Exécuter
                </button>
              )}

              <button
                onClick={() => onUpdateStatus(contract._id, 'cancelled')}
                className="btn-action cancel"
                title="Annuler"
              >
                ❌ Annuler
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer ce smart contrat?')) {
                    onDelete(contract._id);
                  }
                }}
                className="btn-action delete"
                title="Supprimer"
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .contracts-list-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .filters {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .filter-select,
        .search-input {
          padding: 8px 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-input {
          min-width: 300px;
        }

        .stats {
          color: #6b7280;
          font-size: 14px;
        }

        .contracts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .contract-card {
          border: 1px solid #e1e8ed;
          border-radius: 12px;
          padding: 20px;
          background: white;
          transition: all 0.2s ease;
        }

        .contract-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          border-color: #8e44ad;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .header-left h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 16px;
        }

        .badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .header-right .contract-date {
          font-size: 12px;
          color: #6b7280;
        }

        .card-body {
          margin-bottom: 16px;
        }

        .info-section {
          margin-bottom: 12px;
        }

        .info-label {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 2px;
          font-weight: 500;
        }

        .info-value {
          font-size: 14px;
          color: #2c3e50;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .info-sub {
          font-size: 12px;
          color: #9ca3af;
        }

        .financial-details {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 6px;
          margin-top: 12px;
        }

        .financial-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6b7280;
        }

        .financial-item span:last-child {
          font-weight: 500;
          color: #2c3e50;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn-action {
          padding: 6px 12px;
          border: 1px solid #e1e8ed;
          border-radius: 6px;
          background: white;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          flex: 1;
          min-width: 80px;
        }

        .btn-action.edit {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        .btn-action.edit:hover {
          background: #3b82f6;
          color: white;
        }

        .btn-action.execute {
          color: #10b981;
          border-color: #10b981;
        }

        .btn-action.execute:hover {
          background: #10b981;
          color: white;
        }

        .btn-action.cancel {
          color: #ef4444;
          border-color: #ef4444;
        }

        .btn-action.cancel:hover {
          background: #ef4444;
          color: white;
        }

        .btn-action.delete {
          color: #6b7280;
          border-color: #6b7280;
        }

        .btn-action.delete:hover {
          background: #6b7280;
          color: white;
        }

        @media (max-width: 768px) {
          .contracts-grid {
            grid-template-columns: 1fr;
          }
          
          .list-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filters {
            flex-direction: column;
          }
          
          .search-input {
            min-width: auto;
          }
          
          .card-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default SmartContractsList;
