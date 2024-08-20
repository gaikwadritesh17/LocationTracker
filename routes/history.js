const express = require('express');
const Location = require('../models/Location');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().sort({ timestamp: -1 });
    res.render('history', { locations });
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

module.exports = router;
