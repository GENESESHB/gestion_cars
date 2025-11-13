const express = require('express');
const router = express.Router();
const { login, getUserProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', login);
router.get('/me', auth, getUserProfile);

module.exports = router;

