const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  // 1. Partner/User Information (Complete from auth user)
  partnerInfo: {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    partnerName: {
      type: String,
      required: true
    },
    partnerEmail: {
      type: String,
      required: true
    },
    partnerPhone: {
      type: String,
      required: true
    },
    partnerLogo: {
      type: String,
      default: ''
    },
    partnerCountry: {
      type: String,
      required: true
    },
    partnerCity: {
      type: String,
      required: true
    },
    partnerStatus: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'approved'],
      default: 'pending'
    },
    partnerRole: {
      type: String,
      enum: ['agence', 'admin', 'user'],
      default: 'agence'
    },
    partnerCreatedAt: {
      type: Date,
      required: true
    },
    partnerUpdatedAt: {
      type: Date,
      required: true
    }
  },

  // 2. Client/Locataire Information
  clientInfo: {
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    birthDate: {
      type: Date,
      required: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    passport: {
      type: String,
      trim: true,
      default: ''
    },
    cin: {
      type: String,
      trim: true,
      default: ''
    },
    licenseNumber: {
      type: String,
      required: true,
      trim: true
    },
    licenseIssueDate: {
      type: Date,
      required: true
    }
  },

  // 3. Second Driver Information
  secondDriverInfo: {
    lastName: {
      type: String,
      trim: true,
      default: ''
    },
    firstName: {
      type: String,
      trim: true,
      default: ''
    },
    licenseNumber: {
      type: String,
      trim: true,
      default: ''
    },
    licenseIssueDate: {
      type: Date,
      default: null
    }
  },

  // 4. Complete Vehicle Information
  vehicleInfo: {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Vehicle'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    },
    boiteVitesse: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      default: ''
    },
    pricePerDay: {
      type: Number,
      required: true,
      min: 0
    },
    carburant: {
      type: String,
      trim: true,
      default: ''
    },
    niveauReservoir: {
      type: String,
      trim: true,
      default: ''
    },
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
    nombreCles: {
      type: Number,
      default: 1
    },
    kmDepart: {
      type: Number,
      default: 0
    },
    kmRetour: {
      type: Number,
      default: 0
    },
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
    assuranceStartDate: {
      type: Date,
      default: null
    },
    assuranceEndDate: {
      type: Date,
      default: null
    },
    vidangeInterval: {
      type: String,
      trim: true,
      default: ''
    },
    remarques: {
      type: String,
      trim: true,
      default: ''
    },
    dommages: {
      type: [String], // Array of strings for multiple damages
      default: []
    },
    available: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },

  // 5. Rental Information
  rentalInfo: {
    startDateTime: {
      type: Date,
      required: true
    },
    endDateTime: {
      type: Date,
      required: true
    },
    startLocation: {
      type: String,
      required: true,
      trim: true
    },
    endLocation: {
      type: String,
      required: true,
      trim: true
    },
    prixParJour: {
      type: Number,
      required: true,
      min: 0
    },
    prixTotal: {
      type: Number,
      required: true,
      min: 0
    },
    rentalDays: {
      type: Number,
      required: true,
      min: 1
    }
  },

  // 6. Contract Metadata
  contractMetadata: {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending'
    }
  },

  // 7. Contract Status (Main)
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'archived'],
    default: 'pending'
  },

  // 8. Additional Fields for Tracking
  contractNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  signatureClient: {
    type: String,
    default: ''
  },
  signaturePartner: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  documents: [{
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate contract number
contractSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Contract').countDocuments();
    this.contractNumber = `CONTRACT-${Date.now()}-${count + 1}`;
  }
  next();
});

// Indexes for better performance
contractSchema.index({ 'partnerInfo.partnerId': 1 });
contractSchema.index({ 'vehicleInfo.vehicleId': 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ 'rentalInfo.startDateTime': 1 });
contractSchema.index({ 'rentalInfo.endDateTime': 1 });
contractSchema.index({ 'clientInfo.cin': 1 });
contractSchema.index({ 'clientInfo.passport': 1 });

// Virtual for contract duration
contractSchema.virtual('duration').get(function() {
  return this.rentalInfo.rentalDays;
});

// Method to check if contract is active
contractSchema.methods.isActive = function() {
  const now = new Date();
  return this.rentalInfo.startDateTime <= now && this.rentalInfo.endDateTime >= now && this.status === 'active';
};

// Method to check if contract can be cancelled
contractSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const startDate = new Date(this.rentalInfo.startDateTime);
  const timeDiff = startDate.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  return hoursDiff >= 24;
};

// Static method to find contracts by partner
contractSchema.statics.findByPartner = function(partnerId) {
  return this.find({ 'partnerInfo.partnerId': partnerId });
};

// Static method to find active contracts
contractSchema.statics.findActive = function() {
  const now = new Date();
  return this.find({
    'rentalInfo.startDateTime': { $lte: now },
    'rentalInfo.endDateTime': { $gte: now },
    status: 'active'
  });
};

// Static method to find overlapping contracts
contractSchema.statics.findOverlappingContracts = function(vehicleId, startDateTime, endDateTime, excludeContractId = null) {
  const query = {
    'vehicleInfo.vehicleId': vehicleId,
    'rentalInfo.startDateTime': { $lt: new Date(endDateTime) },
    'rentalInfo.endDateTime': { $gt: new Date(startDateTime) },
    status: { $in: ['pending', 'active'] }
  };

  if (excludeContractId) {
    query._id = { $ne: excludeContractId };
  }

  return this.find(query);
};

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
