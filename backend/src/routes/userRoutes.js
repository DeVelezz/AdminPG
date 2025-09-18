const express = require('express');
const user = require('../controllers/user');
const router = express.Router();

router.post('/registro', user.createUser);
router.get('/usuarios', user.getAllUsers);
router.get('/usuarios/:id', user.getUserById);
router.put('/usuarios/:id', user.updateUser);
router.delete('/usuarios/:id', user.deleteUser);



module.exports = router;