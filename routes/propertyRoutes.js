const express = require('express');
const router = express.Router();
const kavlingController = require('../controllers/propertyController');

// Route: GET /api/kavling
router.get('/', kavlingController.getAllKavling);

module.exports = router;