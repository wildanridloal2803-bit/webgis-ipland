const express = require('express');
const propertyController = require('../controllers/propertyController');

const router = express.Router();

router.get('/', propertyController.getHunianAPI);

module.exports = router;
