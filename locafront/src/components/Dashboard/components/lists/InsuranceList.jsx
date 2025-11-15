// components/lists/InsuranceList.jsx
import React from 'react';

const InsuranceList = ({
  vehicles,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm
}) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;

    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const getStatusConfig = (status, endDate) => {
    const daysRemaining = endDate ? getDaysRemaining(endDate) : null;

    const configs = {
      'active': {
        color: '#10b981',
        label: 'Active',
        icon: '✅',
        badge: daysRemaining > 30 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      },
      'pending': {
        color: '#f59e0b',
        label: 'En attente',
        icon: '⏳',
        badge: 'bg-yellow-100 text-yellow-800'
      },
      'expired': {
        color: '#ef4444',
        label: 'Expirée',
        icon: '❌',
        badge: 'bg-red-100 text-red-800'
      },
      'no-insurance': {
        color: '#6b7280',
        label: 'Non assuré',
        icon: '🚫',
        badge: 'bg-gray-100 text-gray-800'
      }
    };

    const config = configs[status] || configs['no-insurance'];

    // Add warning for insurance expiring soon
    if (status === 'active' && daysRemaining <= 30 && daysRemaining > 0) {
      config.label = `Expire dans ${daysRemaining} jour(s)`;
      config.badge = 'bg-orange-100 text-orange-800';
    } else if (status === 'active' && daysRemaining <= 0) {
      config.label = 'Expirée aujourd\'hui';
      config.badge = 'bg-red-100 text-red-800';
    }

    return config;
  };

  if (vehicles.length === 0) {
    return (
      <div className="insurance-list-container">
        <div className="filters-section">
          <div className="filters">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Assurances actives</option>
              <option value="pending">En attente</option>
              <option value="expired">Expirées</option>
              <option value="no-insurance">Non assurés</option>
            </select>

            <input
              type="text"
              placeholder="Rechercher un véhicule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛡️</div>
          <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Aucun véhicule trouvé</h3>
          <p style={{ color: '#9ca3af' }}>Aucun véhicule ne correspond à vos critères de recherche</p>
        </div>
      </div>
    );
  }

  return (
    <div className="insurance-list-container">
      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Assurances actives</option>
            <option value="pending">En attente</option>
            <option value="expired">Expirées</option>
            <option value="no-insurance">Non assurés</option>
          </select>

          <input
            type="text"
            placeholder="Rechercher un véhicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="stats">
          <span>{vehicles.length} véhicule(s) trouvé(s)</span>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="vehicles-grid">
        {vehicles.map(vehicle => {
          const statusConfig = getStatusConfig(vehicle.insuranceInfo.status, vehicle.insuranceInfo.endDate);
          const daysRemaining = getDaysRemaining(vehicle.insuranceInfo.endDate);

          return (
            <div key={vehicle._id} className="vehicle-card">
              {/* Vehicle Header */}
              <div className="card-header">
                <div className="vehicle-image">
                  {vehicle.image ? (
                    <img src={vehicle.image} alt={vehicle.name} />
                  ) : (
                    <div className="no-image">🚗</div>
                  )}
                </div>
                <div className="vehicle-basic-info">
                  <h4>{vehicle.name}</h4>
                  <p>{vehicle.type} • {vehicle.boiteVitesse}</p>
                  {vehicle.matricule && (
                    <p className="matricule">{vehicle.matricule}</p>
                  )}
                </div>
                <div className={`status-badge ${statusConfig.badge}`}>
                  {statusConfig.icon} {statusConfig.label}
                </div>
              </div>

              {/* Insurance Information */}
              <div className="insurance-info">
                <div className="info-section">
                  <div className="info-label">📅 Début assurance</div>
                  <div className="info-value">
                    {vehicle.insuranceInfo.startDate ? formatDate(vehicle.insuranceInfo.startDate) : 'Non définie'}
                  </div>
                </div>

                <div className="info-section">
                  <div className="info-label">⏰ Fin assurance</div>
                  <div className="info-value">
                    {vehicle.insuranceInfo.endDate ? formatDate(vehicle.insuranceInfo.endDate) : 'Non définie'}
                  </div>
                </div>

                {daysRemaining !== null && vehicle.insuranceInfo.status === 'active' && (
                  <div className="info-section">
                    <div className="info-label">⏳ Jours restants</div>
                    <div className="info-value">
                      <span className={daysRemaining <= 30 ? 'warning' : 'normal'}>
                        {daysRemaining} jour(s)
                      </span>
                    </div>
                  </div>
                )}

                {/* Progress Bar for Active Insurance */}
                {vehicle.insuranceInfo.startDate && vehicle.insuranceInfo.endDate && vehicle.insuranceInfo.status === 'active' && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.max(0, Math.min(100, daysRemaining <= 0 ? 0 : (daysRemaining / 365) * 100))}%`,
                          backgroundColor: daysRemaining <= 30 ? '#ef4444' : '#10b981'
                        }}
                      ></div>
                    </div>
                    <div className="progress-labels">
                      <span>Début: {formatDate(vehicle.insuranceInfo.startDate)}</span>
                      <span>Fin: {formatDate(vehicle.insuranceInfo.endDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .insurance-list-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .filters-section {
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
          padding: 10px 12px;
          border: 2px solid #e1e8ed;
          border-radius: 6px;
          font-size: 14px;
          min-width: 200px;
        }

        .search-input {
          min-width: 250px;
        }

        .stats {
          color: #6b7280;
          font-size: 14px;
        }

        .vehicles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .vehicle-card {
          border: 1px solid #e1e8ed;
          border-radius: 12px;
          padding: 20px;
          background: white;
          transition: all 0.2s ease;
        }

        .vehicle-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          border-color: #667eea;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 16px;
          gap: 12px;
        }

        .vehicle-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .vehicle-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          width: 100%;
          height: 100%;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          border-radius: 8px;
        }

        .vehicle-basic-info {
          flex: 1;
        }

        .vehicle-basic-info h4 {
          margin: 0 0 4px 0;
          color: #2c3e50;
          font-size: 16px;
          font-weight: 600;
        }

        .vehicle-basic-info p {
          margin: 2px 0;
          color: #6b7280;
          font-size: 14px;
        }

        .matricule {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .bg-green-100 { background: #d1fae5; }
        .text-green-800 { color: #065f46; }
        .bg-yellow-100 { background: #fef3c7; }
        .text-yellow-800 { color: #92400e; }
        .bg-red-100 { background: #fee2e2; }
        .text-red-800 { color: #991b1b; }
        .bg-gray-100 { background: #f3f4f6; }
        .text-gray-800 { color: #374151; }
        .bg-orange-100 { background: #ffedd5; }
        .text-orange-800 { color: #9a3412; }

        .insurance-info {
          margin-bottom: 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .info-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .info-label {
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        }

        .info-value {
          font-size: 14px;
          color: #2c3e50;
          font-weight: 500;
        }

        .warning {
          color: #ef4444;
          font-weight: 600;
        }

        .normal {
          color: #10b981;
        }

        .progress-section {
          margin-top: 12px;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .vehicles-grid {
            grid-template-columns: 1fr;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filters {
            flex-direction: column;
          }

          .filter-select,
          .search-input {
            min-width: auto;
            width: 100%;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .status-badge {
            align-self: flex-start;
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default InsuranceList;
