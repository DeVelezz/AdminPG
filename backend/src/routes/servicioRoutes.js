const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const authMiddleware = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

// Crear nuevo servicio/cobro (solo admin)
router.post('/', servicioController.createServicio);

// Obtener servicios de un residente específico
router.get('/residente/:residente_id', servicioController.getServiciosByResidente);

// Obtener residentes en mora
router.get('/morosos', servicioController.getMorosos);

// Obtener todos los servicios (admin)
router.get('/', servicioController.getAllServicios);

// Actualizar servicio
router.put('/:id', servicioController.updateServicio);

// Eliminar servicio
router.delete('/:id', servicioController.deleteServicio);

module.exports = router;