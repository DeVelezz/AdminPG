const express = require('express');
const { verifyToken } = require('../middlewares/auth');
// const adminController = require('../controllers/adminController');

app.get("/api/admin", verifyToken, (req, res) => {
    if (req.user.rol !== "admin") {
        return res.status(403).json({ msg: "Acceso denegado" });
    }
    res.json({ msg: `Bienvenido administrador ${req.user.nombre}` });
});