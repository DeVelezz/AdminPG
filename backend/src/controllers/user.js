const bcrypt = require('bcrypt');
const Usuario = require('../models/user');
const Residente = require('../models/resident');

// aca creamos un nuevo usuario y residente
exports.createUser = async (req, res) => {
    try {
        const { nombre, email, contraseña, telefono, propiedad_id } = req.body;

        // Validar que todos los campos requeridos estén presentes
        if (!nombre || !email || !contraseña || !telefono || !propiedad_id) {
            res.status(400).json({ success: false, message: "Faltan campos requeridos", error });
            return;
        }

        // verificar si el email ya existe
        const existingUser = await Usuario.findOne({ where: { email } })

        if (existingUser) {
            res.status(400).json({ success: false, message: "Email ya registrado", error });
            return;
        }


        // encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // crear usuario con rol residente
        const usuario = await Usuario.create({
            nombre,
            email,
            contraseña: hashedPassword,
            rol: 'residente'
        });

        // crear el residente asociado al usuario
        const residente = await Residente.create({
            telefono,
            propiedad_id,
            usuario_id: usuario.id
        });

        res.status(201).json({ success: true, message: "Residente registrado exitosamente", data: { usuario, residente } });


    } catch (error) {
        console.error("Error al registrar residente:", error);
        res.status(500).json({ success: false, message: "Error al registrar residente", error });

    }
};

exports.getAllUsers = async (req, res ) => {
    // creo rama de Harlinson Oquendo
}