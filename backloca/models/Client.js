// models/Client.js
const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
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
    trim: true
  },
  passport: {
    type: String,
    trim: true
  },
  cin: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    trim: true
  },
  licenseIssueDate: {
    type: Date
  },
  entreprise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique CIN per company
ClientSchema.index({ cin: 1, entreprise: 1 }, { unique: true });

module.exports = mongoose.model('Client', ClientSchema);
