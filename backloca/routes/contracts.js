// routes/contracts.js
const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const auth = require('../middleware/auth');

router.post('/', auth, contractController.createContract);
router.get('/my-contracts', auth, contractController.getMyContracts);
router.get('/:id', auth, contractController.getContract);
router.put('/:id', auth, contractController.updateContract);
router.patch('/:id', auth, contractController.updateContractStatus); // Add this line
router.delete('/:id', auth, contractController.deleteContract);

module.exports = router;
