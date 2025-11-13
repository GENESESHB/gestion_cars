// routes/blacklistVerify.js
const express = require('express');
const router = express.Router();
const Blacklist = require('../models/Blacklist');

// ✅ SIMPLE CIN VERIFICATION ONLY
router.get('/verify-by-cin', async (req, res) => {
  try {
    const { cin } = req.query;

    console.log('🔍 Verification request for CIN:', cin);

    // Check if CIN is provided
    if (!cin || cin.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le CIN est requis pour la vérification'
      });
    }

    // Find blacklisted client by CIN only
    const blacklistedClient = await Blacklist.findOne({ 
      cin: cin.trim().toUpperCase() 
    });

    console.log('📋 Found client:', blacklistedClient);

    if (blacklistedClient) {
      return res.json({
        isBlacklisted: true,
        client: {
          cin: blacklistedClient.cin,
          passport: blacklistedClient.passport,
          licenseNumber: blacklistedClient.licenseNumber,
          reason: blacklistedClient.reason,
          dateAdded: blacklistedClient.dateAdded
        }
      });
    } else {
      return res.json({
        isBlacklisted: false,
        client: null
      });
    }
  } catch (error) {
    console.error('❌ Error verifying CIN:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la vérification du CIN'
    });
  }
});

module.exports = router;
