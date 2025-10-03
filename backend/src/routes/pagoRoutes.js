const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const { verifyToken } = require('../middlewares/auth');

// Procesar pago por residente
router.post('/residente', verifyToken, pagoController.procesarPagoResidente);

// Registrar pago por admin
router.post('/admin', verifyToken, pagoController.registrarPagoAdmin);

// Deshacer pago por admin
router.post('/admin/deshacer/:servicioId', verifyToken, pagoController.deshacerPagoAdmin);

// Obtener historial de pagos de un residente
router.get('/historial/:residenteId', verifyToken, pagoController.getHistorialPagos);

module.exports = router;
