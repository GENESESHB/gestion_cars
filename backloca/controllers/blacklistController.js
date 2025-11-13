// controllers/blacklistController.js
const Blacklist = require('../models/Blacklist');

exports.addToBlacklist = async (req, res) => {
  try {
    const { cin, passport, licenseNumber, reason } = req.body;

    // Check if at least one identifier is provided
    if (!cin && !passport && !licenseNumber) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un identifiant (CIN, Passeport ou Permis) est requis'
      });
    }

    // Check if client with same CIN already exists
    if (cin) {
      const existingByCIN = await Blacklist.findOne({ cin });
      if (existingByCIN) {
        return res.status(400).json({
          success: false,
          message: 'Un client avec ce CIN est déjà dans la liste noire'
        });
      }
    }

    // Check if client with same passport already exists
    if (passport) {
      const existingByPassport = await Blacklist.findOne({ passport });
      if (existingByPassport) {
        return res.status(400).json({
          success: false,
          message: 'Un client avec ce passeport est déjà dans la liste noire'
        });
      }
    }

    // Check if client with same license number already exists
    if (licenseNumber) {
      const existingByLicense = await Blacklist.findOne({ licenseNumber });
      if (existingByLicense) {
        return res.status(400).json({
          success: false,
          message: 'Un client avec ce numéro de permis est déjà dans la liste noire'
        });
      }
    }

    const blacklistedClient = new Blacklist({
      cin: cin || undefined,
      passport: passport || undefined,
      licenseNumber: licenseNumber || undefined,
      reason
    });

    await blacklistedClient.save();

    res.status(201).json({
      success: true,
      message: 'Client ajouté à la liste noire avec succès',
      blacklistedClient
    });
  } catch (error) {
    console.error(error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cette identifiant existe déjà dans la liste noire'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout à la liste noire'
    });
  }
};

exports.getBlacklist = async (req, res) => {
  try {
    const blacklist = await Blacklist.find().sort({ dateAdded: -1 });
    res.json({
      success: true,
      blacklist
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la liste noire'
    });
  }
};

exports.checkBlacklist = async (req, res) => {
  try {
    const { cin, passport, licenseNumber } = req.query;

    let query = {};
    if (cin) query.cin = cin;
    if (passport) query.passport = passport;
    if (licenseNumber) query.licenseNumber = licenseNumber;

    if (Object.keys(query).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Au moins un identifiant (CIN, Passeport ou Permis) est requis'
      });
    }

    const blacklisted = await Blacklist.findOne(query);

    res.json({
      success: true,
      isBlacklisted: !!blacklisted,
      client: blacklisted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification'
    });
  }
};

exports.getBlacklistEntry = async (req, res) => {
  try {
    const blacklisted = await Blacklist.findById(req.params.id);

    if (!blacklisted) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé dans la liste noire'
      });
    }

    res.json({
      success: true,
      blacklistedClient: blacklisted
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération'
    });
  }
};

exports.removeFromBlacklist = async (req, res) => {
  try {
    const blacklisted = await Blacklist.findById(req.params.id);

    if (!blacklisted) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé dans la liste noire'
      });
    }

    await Blacklist.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Client retiré de la liste noire avec succès'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression'
    });
  }
};
