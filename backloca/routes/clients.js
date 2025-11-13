// routes/clients.js
const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const auth = require('../middleware/auth');

// @route   GET /api/clients/my-clients
// @desc    Get user's clients
// @access  Private
router.get('/my-clients', auth, async (req, res) => {
  try {
    const clients = await Client.find({ entreprise: req.user.id }).sort({ createdAt: -1 });
    res.json({ clients });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/clients
// @desc    Create a new client
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      lastName,
      firstName,
      birthDate,
      phone,
      address,
      passport,
      cin,
      licenseNumber,
      licenseIssueDate
    } = req.body;

    // Check if client with same CIN already exists for this company
    const existingClient = await Client.findOne({
      entreprise: req.user.id,
      cin: cin
    });

    if (existingClient) {
      return res.status(400).json({
        msg: 'Un client avec ce CIN existe déjà'
      });
    }

    const newClient = new Client({
      lastName,
      firstName,
      birthDate,
      phone,
      address,
      passport,
      cin,
      licenseNumber,
      licenseIssueDate,
      entreprise: req.user.id
    });

    const client = await newClient.save();
    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Client not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/clients/:id
// @desc    Update a client
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      lastName,
      firstName,
      birthDate,
      phone,
      address,
      passport,
      cin,
      licenseNumber,
      licenseIssueDate
    } = req.body;

    let client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ msg: 'Client non trouvé' });
    }

    // Check if client belongs to user's company
    if (client.entreprise.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }

    // Check if CIN is already taken by another client
    const existingClient = await Client.findOne({
      entreprise: req.user.id,
      cin: cin,
      _id: { $ne: req.params.id }
    });

    if (existingClient) {
      return res.status(400).json({
        msg: 'Un autre client avec ce CIN existe déjà'
      });
    }

    client = await Client.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          lastName,
          firstName,
          birthDate,
          phone,
          address,
          passport,
          cin,
          licenseNumber,
          licenseIssueDate
        }
      },
      { new: true }
    );

    res.json(client);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Client non trouvé' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete a client
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ msg: 'Client non trouvé' });
    }

    // Check if client belongs to user's company
    if (client.entreprise.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Non autorisé' });
    }

    await Client.findByIdAndRemove(req.params.id);
    res.json({ msg: 'Client supprimé' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Client non trouvé' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
