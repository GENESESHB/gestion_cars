// components/InsuranceManagement.jsx
import React, { useState } from 'react';
import InsuranceList from './lists/InsuranceList';

const InsuranceManagement = ({ 
  user, 
  vehicles, 
  insurances, 
  setMessage 
}) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get vehicles with insurance information
  const vehiclesWithInsurance = vehicles.map(vehicle => ({
    ...vehicle,
    insuranceInfo: {
      startDate: vehicle.assuranceStartDate,
      endDate: vehicle.assuranceEndDate,
      status: getInsuranceStatus(vehicle.assuranceStartDate, vehicle.assuranceEndDate)
    }
  }));

  function getInsuranceStatus(startDate, endDate) {
    if (!startDate || !endDate) return 'no-insurance';
    
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'pending';
    if (now >= start && now <= end) return 'active';
    return 'expired';
  }

  const filteredVehicles = vehiclesWithInsurance.filter(vehicle => {
    const matchesFilter = filter === 'all' || vehicle.insuranceInfo.status === filter;
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      vehicle.name?.toLowerCase().includes(searchLower) ||
      vehicle.type?.toLowerCase().includes(searchLower) ||
      vehicle.matricule?.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="insurance-management">
      <div className="page-header">
        <h1>🛡️ Gestion des Assurances</h1>
        <p>Visualisation des périodes d'assurance des véhicules</p>
      </div>

      {/* Statistics */}
      <div className="insurance-stats">
        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-info">
            <h3>{vehicles.length}</h3>
            <p>Véhicules total</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#10b981' }}>✅</div>
          <div className="stat-info">
            <h3>{vehiclesWithInsurance.filter(v => v.insuranceInfo.status === 'active').length}</h3>
            <p>Assurances actives</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#f59e0b' }}>⏳</div>
          <div className="stat-info">
            <h3>{vehiclesWithInsurance.filter(v => v.insuranceInfo.status === 'pending').length}</h3>
            <p>En attente</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#ef4444' }}>❌</div>
          <div className="stat-info">
            <h3>{vehiclesWithInsurance.filter(v => v.insuranceInfo.status === 'expired').length}</h3>
            <p>Expirées</p>
          </div>
        </div>
      </div>

      <InsuranceList
        vehicles={filteredVehicles}
        filter={filter}
        setFilter={setFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <style jsx>{`
        .insurance-management {
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 30px;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 12px;
        }

        .page-header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
        }

        .page-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
        }

        .insurance-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          padding: 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          border-left: 4px solid #667eea;
        }

        .stat-icon {
          font-size: 32px;
          margin-right: 16px;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 24px;
          color: #2c3e50;
        }

        .stat-info p {
          margin: 4px 0 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .insurance-stats {
            grid-template-columns: 1fr 1fr;
          }
          
          .page-header {
            padding: 16px;
          }
          
          .page-header h1 {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .insurance-stats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default InsuranceManagement;
