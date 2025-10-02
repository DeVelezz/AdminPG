const express = require('express');
const user = require('../controllers/user');
const userResumen = require('../controllers/userResumen');
const auth = require('../controllers/auth');
const router = express.Router();

// Rutas de autenticación
router.post('/login', auth.login);

// Rutas de usuarios
router.post('/registro', user.createUser);
router.get('/usuarios', user.getAllUsers);
router.get('/usuarios/resumen', userResumen.getUsuariosConResumen);
router.get('/usuarios/:id', user.getUserById);
router.put('/usuarios/:id', user.updateUser);
router.delete('/usuarios/:id', user.deleteUser);

module.exports = router;