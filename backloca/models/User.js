const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  entreprise: { type: String, required: true },
  number: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  logoEntreprise: { type: String, default: '' },
  country: { type: String, default: '' },
  city: { type: String, default: '' },
  ip: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  role: {
    type: String,
    enum: ['user', 'agence', 'admin'],
    default: 'agence'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
