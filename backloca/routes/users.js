const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // ✅ For password hashing
const User = require('../models/User');
const upload = require('../config/cloudinary'); // ✅ Cloudinary upload

// 📤 Partner Registration Route
router.post('/demande', upload.single('logoEntreprise'), async (req, res) => {
  try {
    const { name, entreprise, number, email, password, country, city } = req.body;
    const logoEntreprise = req.file ? req.file.path : ''; // ✅ Cloudinary gives a hosted URL

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // ✅ Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create new user with hashed password
    const newUser = new User({
      name,
      entreprise,
      number,
      email,
      password: hashedPassword, // Store hashed password
      logoEntreprise,
      country,
      city,
      ip: req.ip
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Demande submitted successfully! Waiting for admin approval.',
      user: {
        _id: newUser._id,
        name: newUser.name,
        entreprise: newUser.entreprise,
        email: newUser.email,
        logoEntreprise: newUser.logoEntreprise,
        country: newUser.country,
        city: newUser.city
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;


