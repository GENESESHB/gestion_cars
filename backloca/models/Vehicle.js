const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Citadine', 'Compacte', 'Berline', 'Berline premium', 'Coupé', 
      'Cabriolet', 'Break', 'SUV', 'SUV compact', 'SUV premium', 'Crossover'
    ]
  },
  boiteVitesse: {
    type: String,
    required: true,
    enum: ['Manuelle', 'Automatique']
  },
  description: {
    type: String
  },
  image: {
    type: String
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  // Nouveaux champs pour le carburant et l'état
  carburant: {
    type: String,
    required: true,
    enum: ['Gasoil', 'Essence', 'Hybride', 'Électrique']
  },
  niveauReservoir: {
    type: String,
    required: true,
    enum: ['1/4', '1/2', '3/4', 'PLEIN']
  },
  // Équipements audio
  radio: {
    type: Boolean,
    default: false
  },
  gps: {
    type: Boolean,
    default: false
  },
  mp3: {
    type: Boolean,
    default: false
  },
  cd: {
    type: Boolean,
    default: false
  },
  // Clés et kilométrage
  nombreCles: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  kmDepart: {
    type: Number,
    required: true,
    min: 0
  },
  kmRetour: {
    type: Number,
    min: 0
  },
  // Impôts
  impot2026: {
    type: Boolean,
    default: false
  },
  impot2027: {
    type: Boolean,
    default: false
  },
  impot2028: {
    type: Boolean,
    default: false
  },
  impot2029: {
    type: Boolean,
    default: false
  },
  // Assurance et maintenance
  assuranceStartDate: {
    type: Date
  },
  assuranceEndDate: {
    type: Date
  },
  vidangeInterval: {
    type: String,
    enum: ['8000', '10000', '12000']
  },
  remarques: {
    type: String
  },
  // Dommages du véhicule
  dommages: [{
    type: String
  }],
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
vehicleSchema.index({ partnerId: 1, available: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ pricePerDay: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
