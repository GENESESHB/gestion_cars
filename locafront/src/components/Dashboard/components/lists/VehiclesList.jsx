
// components/lists/VehiclesList.jsx
import React, { useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiPower } from 'react-icons/fi';

const VehiclesList = ({ vehicles, onEdit, onDelete, onToggleAvailability }) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // '', 'available', 'unavailable'

  const vehicleTypes = useMemo(() => {
    const types = Array.from(new Set(vehicles.map(v => v.type).filter(Boolean)));
    return types;
  }, [vehicles]);

  const createOptionsLabel = (v) => {
    const opts = [];
    if (v.gps) opts.push('GPS');
    if (v.radio) opts.push('Radio');
    if (v.mp3) opts.push('MP3');
    if (v.cd) opts.push('CD');
    return opts.length ? opts.join(' • ') : 'Aucun équipement spécial';
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const q = search.toLowerCase().trim();

      const matchesSearch =
        !q ||
        v.name?.toLowerCase().includes(q) ||
        v.type?.toLowerCase().includes(q) ||
        v.carburant?.toLowerCase().includes(q);

      const matchesType = !filterType || v.type === filterType;

      const matchesStatus =
        !filterStatus ||
        (filterStatus === 'available' && v.available) ||
        (filterStatus === 'unavailable' && !v.available);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [vehicles, search, filterType, filterStatus]);

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="vehicles-empty">
        <h3>Aucun véhicule trouvé</h3>
        <p>Ajoutez votre premier véhicule pour commencer.</p>
      </div>
    );
  }

  const handleDeleteClick = (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce véhicule ?')) {
      onDelete(id);
    }
  };

  const total = vehicles.length;

  return (
    <div className="vehicles-list-wrapper">
      {/* TOPBAR LISTE */}
      <header className="vehicles-list-topbar">
        <div className="vlt-left">
          <h2>Parc véhicules</h2>
          <span>{total} véhicule{total > 1 ? 's' : ''} dans votre parc</span>
        </div>

        <div className="vlt-right">
          <div className="vlt-search">
            <input
              type="text"
              placeholder="Rechercher par nom, type, carburant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tous les types</option>
            {vehicleTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="unavailable">Non disponible</option>
          </select>
        </div>
      </header>

      {/* TABLE / CARD */}
      <section className="list-card">
        <div className="list-header">
          <div>Véhicule</div>
          <div>Caractéristiques</div>
          <div>Équipements</div>
          <div>Prix</div>
          <div>Actions</div>
        </div>

        <div>
          {filteredVehicles.map((v) => (
            <div key={v._id} className="vehicle-row">
              {/* Col 1 : image + nom + type */}
              <div className="vehicle-main">
                <div className="vehicle-img-wrap">
                  {v.image ? (
                    <img src={v.image} alt={v.name} />
                  ) : (
                    <div className="vehicle-img-placeholder">No image</div>
                  )}
                </div>
                <div>
                  <div className="vehicle-info-title">{v.name || 'Sans nom'}</div>
                  <div className="vehicle-info-sub">
                    {v.carburant || '—'} • {v.boiteVitesse || '—'}
                  </div>
                  {v.type && (
                    <div className="badge badge-type">{v.type}</div>
                  )}
                </div>
              </div>

              {/* Col 2 : caractéristiques */}
              <div className="vehicle-specs">
                <span className="spec-pill">Carburant : {v.carburant || '—'}</span>
                <span className="spec-pill">Boîte : {v.boiteVitesse || '—'}</span>
                <span className="spec-pill">Clés : {v.nombreCles ?? '—'}</span>
                <span className="spec-pill">Réservoir : {v.niveauReservoir || '—'}</span>
              </div>

              {/* Col 3 : équipements */}
              <div className="vehicle-options">
                {createOptionsLabel(v)}
              </div>

              {/* Col 4 : prix + statut */}
              <div className="vehicle-price">
                {v.pricePerDay ? (
                  <>
                    {v.pricePerDay} <span>MAD/jour</span>
                  </>
                ) : (
                  <span>—</span>
                )}
                <br />
                <span
                  className={
                    'badge-status ' + (v.available ? '' : 'offline')
                  }
                >
                  {v.available ? 'Disponible' : 'Non dispo'}
                </span>
              </div>

              {/* Col 5 : actions */}
              <div className="vehicle-actions">
                {/* <button
                  type="button"
                  className={`btn-icon btn-icon--status ${v.available ? 'on' : 'off'}`}
                  onClick={() => onToggleAvailability(v._id, !v.available)}
                >
                  <FiPower />
                  <span>{v.available ? 'Désactiver' : 'Activer'}</span>
                </button> */}

                <button
                  type="button"
                  className="btn-icon btn-icon--edit"
                  onClick={() => onEdit(v)}
                >
                  <FiEdit2 />
                  <span>Modifier</span>
                </button>

                <button
                  type="button"
                  className="btn-icon btn-icon--delete"
                  onClick={() => handleDeleteClick(v._id)}
                >
                  <FiTrash2 />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="list-footer">
          <span>{filteredVehicles.length} véhicule(s) affiché(s)</span>
        </div>
      </section>
    </div>
  );
};

export default VehiclesList;
