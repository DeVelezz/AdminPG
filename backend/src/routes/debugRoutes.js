const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');

router.post('/create-admin', debugController.createDefaultAdmin);

module.exports = router;
