const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { upload, handleUploadErrors } = require('../middleware/upload');
const auth = require('../middleware/auth');

router.post('/', 
  auth, 
  upload.single('image'), 
  handleUploadErrors,
  vehicleController.addVehicle
);

router.get('/my-vehicles', auth, vehicleController.getMyVehicles);
router.get('/:id', auth, vehicleController.getVehicle);
router.put('/:id', 
  auth, 
  upload.single('image'), 
  handleUploadErrors,
  vehicleController.updateVehicle
);
router.delete('/:id', auth, vehicleController.deleteVehicle);

module.exports = router;
