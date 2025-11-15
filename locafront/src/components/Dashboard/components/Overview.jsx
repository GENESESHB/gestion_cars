// // components/Overview.jsx
// import React from 'react';

// const Overview = ({ user, vehicles, contracts, blacklist }) => {
//   // SVG Icons for stats
//   const VehicleIcon = () => (
//     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
//       <circle cx="7" cy="17" r="2"></circle>
//       <path d="M9 17h6"></path>
//       <circle cx="17" cy="17" r="2"></circle>
//     </svg>
//   );

//   const ContractIcon = () => (
//     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//       <polyline points="14 2 14 8 20 8"></polyline>
//       <line x1="16" y1="13" x2="8" y2="13"></line>
//       <line x1="16" y1="17" x2="8" y2="17"></line>
//       <polyline points="10 9 9 9 8 9"></polyline>
//     </svg>
//   );

//   const BlacklistIcon = () => (
//     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <circle cx="12" cy="12" r="10"></circle>
//       <line x1="15" y1="9" x2="9" y2="15"></line>
//       <line x1="9" y1="9" x2="15" y2="15"></line>
//     </svg>
//   );

//   const CheckIcon = () => (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <polyline points="20 6 9 17 4 12"></polyline>
//     </svg>
//   );

//   const UserIcon = () => (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
//       <circle cx="12" cy="7" r="4"></circle>
//     </svg>
//   );

//   return (
//     <div>
//       {/* Welcome Card */}
//       <div className="dashboard-card">
//         <h2>Bienvenue sur votre espace partenaire</h2>

//         <div className="grid-auto-fit">
//           <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px' }}>
//             <h4>Informations du compte</h4>
//             <p><strong>Email:</strong> {user.email}</p>
//             <p><strong>Téléphone:</strong> {user.number}</p>
//             <p><strong>Localisation:</strong> {user.city} {user.country && `, ${user.country}`}</p>
//           </div>

//           <div style={{ padding: '16px', background: '#f8f9fa', borderRadius: '6px' }}>
//             <h4>Statut</h4>
//             <p>
//               <strong>Statut:</strong>
//               <span style={{
//                 color: user.status === 'approved' ? '#28a745' : '#ffc107',
//                 fontWeight: 'bold',
//                 marginLeft: '8px',
//                 display: 'inline-flex',
//                 alignItems: 'center',
//                 gap: '4px'
//               }}>
//                 {user.status === 'approved' ? (
//                   <>
//                     <CheckIcon /> Approuvé
//                   </>
//                 ) : (
//                   'En attente'
//                 )}
//               </span>
//             </p>
//             <p><strong>Rôle:</strong> {user.role}</p>
//           </div>
//         </div>
//       </div>

//       {/* Statistics Cards */}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
//             <VehicleIcon />
//           </div>
//           <div className="stat-number">{vehicles.length}</div>
//           <div className="stat-label">Véhicules</div>
//         </div>

//         <div className="stat-card">
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
//             <ContractIcon />
//           </div>
//           <div className="stat-number">{contracts.length}</div>
//           <div className="stat-label">Contrats</div>
//         </div>

//         <div className="stat-card">
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
//             <BlacklistIcon />
//           </div>
//           <div className="stat-number">{blacklist.length}</div>
//           <div className="stat-label">Liste Noire</div>
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="dashboard-card">
//         <h3>Activité Récente</h3>
//         <div className="text-muted">
//           <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <CheckIcon />
//             Votre compte a été approuvé avec succès
//           </p>
//           <p>Prêt à gérer vos véhicules</p>
//           <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//             <UserIcon />
//             Connecté en tant que: {user.name}
//           </p>
//           {vehicles.length > 0 && <p>{vehicles.length} véhicule(s) enregistré(s)</p>}
//           {contracts.length > 0 && <p>{contracts.length} contrat(s) créé(s)</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Overview;

// components/Overview.jsx
import React from 'react';
import {
  FaCarSide,
  FaFileContract,
  FaBan,
  FaUsers
} from 'react-icons/fa';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const Overview = ({ user, vehicles, contracts, blacklist, clients = [] }) => {
  const vehiclesCount = vehicles.length || 0;
  const contractsCount = contracts.length || 0;
  const blacklistCount = blacklist.length || 0;
  const clientsCount = clients.length || 0;

  // Données factices pour les graphiques (tu pourras brancher de vraies stats plus tard)
  const engagementData = [
    { name: 'Lun', visites: 80, contrats: 20 },
    { name: 'Mar', visites: 120, contrats: 35 },
    { name: 'Mer', visites: 180, contrats: 55 },
    { name: 'Jeu', visites: 140, contrats: 40 },
    { name: 'Ven', visites: 110, contrats: 32 },
    { name: 'Sam', visites: 90, contrats: 24 },
    { name: 'Dim', visites: 70, contrats: 18 }
  ];

  const ventesData = [
    { name: 'S1', vehicules: vehiclesCount, contrats: contractsCount },
    { name: 'S2', vehicules: Math.max(1, vehiclesCount - 1), contrats: Math.max(1, contractsCount - 2) },
    { name: 'S3', vehicules: vehiclesCount + 1, contrats: contractsCount + 1 },
    { name: 'S4', vehicules: vehiclesCount, contrats: Math.max(1, contractsCount - 1) }
  ];

  // Score "satisfaction" simple (tu peux calculer à partir de vrais KPIs)
  const satisfaction = 700;

  return (
    <div className="overview-page">
      {/* HEADER TOP */}
      <div className="overview-header-strip">
        <div className="overview-user-mini">
          <p className="mini-label">Agence</p>
          <p className="mini-value">{user.entreprise}</p>
        </div>
      </div>

      {/* 1) CARTES KPI EN HAUT */}
      <div className="overview-kpi-row">
        <div className="kpi-card kpi-1">
          <div className="kpi-label">Véhicules</div>
          <div className="kpi-value">
            {vehiclesCount}
            <span className="kpi-unit">en flotte</span>
          </div>
          <div className="kpi-footer">
            <FaCarSide />
            <span>Flotte enregistrée</span>
          </div>
        </div>

        <div className="kpi-card kpi-2">
          <div className="kpi-label">Contrats</div>
          <div className="kpi-value">
            {contractsCount}
            <span className="kpi-unit">créés</span>
          </div>
          <div className="kpi-footer">
            <FaFileContract />
            <span>Contrats en base</span>
          </div>
        </div>

        <div className="kpi-card kpi-3">
          <div className="kpi-label">Clients</div>
          <div className="kpi-value">
            {clientsCount}
            <span className="kpi-unit">profils</span>
          </div>
          <div className="kpi-footer">
            <FaUsers />
            <span>Base clients</span>
          </div>
        </div>

        <div className="kpi-card kpi-4">
          <div className="kpi-label">Liste noire</div>
          <div className="kpi-value">
            {blacklistCount}
            <span className="kpi-unit">clients</span>
          </div>
          <div className="kpi-footer">
            <FaBan />
            <span>Risque & incidents</span>
          </div>
        </div>
      </div>

      {/* 2) MILIEU : JAUGE + GRAPH LIGNE */}
      <div className="overview-middle-grid">
        {/* Jauge satisfaction */}
        <div className="dashboard-card overview-gauge-card">
          <h3>Indice de performance</h3>
          <p className="gauge-sub">Score interne (NPS simplifié)</p>
          <div className="gauge-wrapper">
            <div className="gauge-outer">
              <div
                className="gauge-fill"
                style={{ '--gauge-value': `${satisfaction}` }}
              ></div>
              <div className="gauge-inner">
                <span className="gauge-value">{satisfaction},0</span>
                <span className="gauge-label">Score global</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graphique Engagement & Ventes */}
        <div className="dashboard-card overview-line-card">
          <div className="dashboard-card-header">
            <h3>Engagement & contrats</h3>
            <span className="badge-soft">Données hebdomadaires</span>
          </div>
          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer>
              <LineChart
                data={engagementData}
                margin={{ top: 10, right: 18, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="visites"
                  stroke="#2C356F"
                  strokeWidth={2}
                  dot={false}
                  name="Visites"
                />
                <Line
                  type="monotone"
                  dataKey="contrats"
                  stroke="#EC811D"
                  strokeWidth={2}
                  dot={false}
                  name="Contrats"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3) BAS : GRAND GRAPHIQUE BARRES */}
      <div className="dashboard-card overview-bar-card">
        <div className="dashboard-card-header">
          <h3>Véhicules & contrats par période</h3>
          <span className="badge-soft">Vue synthétique</span>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart
              data={ventesData}
              margin={{ top: 10, right: 18, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="vehicules"
                name="Véhicules"
                fill="#EC811D"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="contrats"
                name="Contrats"
                fill="#2C356F"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;
