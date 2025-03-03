const express = require('express');
const router = express.Router();
const tempController = require('../controllers/tempController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas con autenticación JWT
router.get('/temperaturas', authMiddleware, tempController.getTemperaturas);
router.post('/temperaturas', authMiddleware, tempController.addTemperatura);

module.exports = router;
