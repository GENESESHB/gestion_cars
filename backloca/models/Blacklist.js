const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  cin: {
    type: String,
    required: true,
    unique: true
  },
  passport: {
    type: String,
    unique: true,
    sparse: true
  },
  licenseNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  reason: String,
  dateAdded: {
    type: Date,
    default: Date.now
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Méthode statique pour vérifier si un client est blacklisté
blacklistSchema.statics.checkBlacklist = async function(clientData) {
  const { clientCIN, clientPassport, clientLicenseNumber } = clientData;

  const blacklisted = await this.findOne({
    $or: [
      { cin: clientCIN },
      { passport: clientPassport },
      { licenseNumber: clientLicenseNumber }
    ]
  });

  return blacklisted;
};

// Check if model already exists before compiling
module.exports = mongoose.models.Blacklist || mongoose.model('Blacklist', blacklistSchema);
