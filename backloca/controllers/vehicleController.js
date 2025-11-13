const Vehicle = require('../models/Vehicle');

exports.addVehicle = async (req, res) => {
  try {
    const {
      name,
      type,
      boiteVitesse,
      description,
      pricePerDay,
      carburant,
      niveauReservoir,
      radio,
      gps,
      mp3,
      cd,
      nombreCles,
      kmDepart,
      kmRetour,
      impot2026,
      impot2027,
      impot2028,
      impot2029,
      assuranceStartDate,
      assuranceEndDate,
      vidangeInterval,
      remarques,
      dommages
    } = req.body;

    const partnerId = req.user.id;

    let image = '';
    if (req.file) {
      image = req.file.path;
    }

    // Convertir les valeurs booléennes
    const booleanFields = {
      radio: radio === 'true',
      gps: gps === 'true',
      mp3: mp3 === 'true',
      cd: cd === 'true',
      impot2026: impot2026 === 'true',
      impot2027: impot2027 === 'true',
      impot2028: impot2028 === 'true',
      impot2029: impot2029 === 'true'
    };

    // Parser les dommages si c'est une string
    let dommagesArray = [];
    if (dommages) {
      if (typeof dommages === 'string') {
        dommagesArray = dommages.split(',');
      } else if (Array.isArray(dommages)) {
        dommagesArray = dommages;
      }
    }

    const vehicle = new Vehicle({
      name,
      type,
      boiteVitesse,
      description,
      image,
      pricePerDay: parseFloat(pricePerDay),
      carburant,
      niveauReservoir,
      ...booleanFields,
      nombreCles: parseInt(nombreCles),
      kmDepart: parseInt(kmDepart),
      kmRetour: kmRetour ? parseInt(kmRetour) : null,
      assuranceStartDate: assuranceStartDate || null,
      assuranceEndDate: assuranceEndDate || null,
      vidangeInterval: vidangeInterval || null,
      remarques,
      dommages: dommagesArray,
      partnerId
    });

    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Véhicule ajouté avec succès',
      vehicle
    });
  } catch (error) {
    console.error('Erreur ajout véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du véhicule',
      error: error.message
    });
  }
};

exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ partnerId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      vehicles
    });
  } catch (error) {
    console.error('Erreur récupération véhicules:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des véhicules',
      error: error.message
    });
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    if (vehicle.partnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce véhicule'
      });
    }

    res.json({
      success: true,
      vehicle
    });
  } catch (error) {
    console.error('Erreur récupération véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const {
      name,
      type,
      boiteVitesse,
      description,
      pricePerDay,
      carburant,
      niveauReservoir,
      radio,
      gps,
      mp3,
      cd,
      nombreCles,
      kmDepart,
      kmRetour,
      impot2026,
      impot2027,
      impot2028,
      impot2029,
      assuranceStartDate,
      assuranceEndDate,
      vidangeInterval,
      remarques,
      dommages
    } = req.body;

    const existingVehicle = await Vehicle.findById(req.params.id);
    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    if (existingVehicle.partnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce véhicule'
      });
    }

    // Convertir les valeurs booléennes
    const booleanFields = {
      radio: radio === 'true',
      gps: gps === 'true',
      mp3: mp3 === 'true',
      cd: cd === 'true',
      impot2026: impot2026 === 'true',
      impot2027: impot2027 === 'true',
      impot2028: impot2028 === 'true',
      impot2029: impot2029 === 'true'
    };

    // Parser les dommages si c'est une string
    let dommagesArray = [];
    if (dommages) {
      if (typeof dommages === 'string') {
        dommagesArray = dommages.split(',');
      } else if (Array.isArray(dommages)) {
        dommagesArray = dommages;
      }
    }

    let updateData = {
      name,
      type,
      boiteVitesse,
      description,
      pricePerDay: parseFloat(pricePerDay),
      carburant,
      niveauReservoir,
      ...booleanFields,
      nombreCles: parseInt(nombreCles),
      kmDepart: parseInt(kmDepart),
      kmRetour: kmRetour ? parseInt(kmRetour) : null,
      assuranceStartDate: assuranceStartDate || null,
      assuranceEndDate: assuranceEndDate || null,
      vidangeInterval: vidangeInterval || null,
      remarques,
      dommages: dommagesArray
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Véhicule mis à jour avec succès',
      vehicle
    });
  } catch (error) {
    console.error('Erreur mise à jour véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du véhicule',
      error: error.message
    });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    if (vehicle.partnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce véhicule'
      });
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Véhicule supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du véhicule',
      error: error.message
    });
  }
};

// Nouvelle fonction pour changer la disponibilité
exports.toggleVehicleAvailability = async (req, res) => {
  try {
    const { available } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Véhicule non trouvé'
      });
    }

    if (vehicle.partnerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce véhicule'
      });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { available },
      { new: true }
    );

    res.json({
      success: true,
      message: `Véhicule ${available ? 'activé' : 'désactivé'} avec succès`,
      vehicle: updatedVehicle
    });
  } catch (error) {
    console.error('Erreur changement statut véhicule:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut du véhicule',
      error: error.message
    });
  }
};
