// routes/blacklist.js
const express = require('express');
const router = express.Router();
const blacklistController = require('../controllers/blacklistController');
const auth = require('../middleware/auth'); // Add this line

// Add auth middleware to all routes
router.post('/', auth, blacklistController.addToBlacklist);
router.post('/check', auth, blacklistController.checkBlacklist);
router.get('/', auth, blacklistController.getBlacklist);
router.get('/:id', auth, blacklistController.getBlacklistEntry);
router.delete('/:id', auth, blacklistController.removeFromBlacklist);

module.exports = router;
