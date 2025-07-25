const User = require('../models/userModel');

exports.createUser = async (req, res) => {
    const { nombre, correo, contrasena, rol } = req.body;
    if (!nombre || !correo || !contrasena || !rol) {
        return res.status(400).send('Todos los campos son obligatorios');
    }
    try {
        const newUser = await User.create({nombre, correo, contrasena, rol});
        res.status(201).json(newUser);
    }
    catch (error) {
    console.error("Error creando usuario:", error);   
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).send("El email ya está registrado");
    }
    res.status(500).send("Error creando usuario");
  }
};

