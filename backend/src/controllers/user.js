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

exports.getAllUsers = async (req, res) => {
    // creo rama de Harlinson Oquendo
    try {
        // aca obtenemos todos los usuarios con su residente asociado
        const users = await Usuario.findAll({
            include: Residente
        })
        res.status(200).json({ success: true, data: users });
    } catch (error) {

        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ success: false, message: "Error al obtener usuarios", error });
    }
};

// aca obtenemos todos los usuarios con su residente asociado
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findByPk(id, {
            include: Residente
        });
        if (!user) {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
            return;
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {


        console.error("Error al obtener usuario:", error);
        res.status(500).json({ success: false, message: "Error al obtener usuario", error });
    }
};

// aca actualizamos un usuario y su residente asociado
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, contraseña, telefono, propiedad_id } = req.body;
        const user = await Usuario.findByPk(id);
        if (!user) {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
            return;
        }
        // actualizar campos del usuario
        user.nombre = nombre || user.nombre;
        user.email = email || user.email;
        if (contraseña) {
            user.contraseña = await bcrypt.hash(contraseña, 10);
        }
        await user.save();

        // actualizar campos del residente asociado
        const residente = await Residente.findOne({ where: { usuario_id: id } });
        if (residente) {
            residente.telefono = telefono || residente.telefono;
            residente.propiedad_id = propiedad_id || residente.propiedad_id;
            await residente.save();
        }
        res.status(200).json({ success: true, message: "Usuario actualizado exitosamente", data: { user, residente } });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).json({ success: false, message: "Error al actualizar usuario", error });
    }
};

// aca eliminamos un usuario y su residente asociado
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findByPk(id);
        if (!user) {
            res.status(404).json({ success: false, message: "Usuario no encontrado" });
            return;
        }
        await user.destroy();
        res.status(200).json({ success: true, message: "Usuario eliminado exitosamente" });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        res.status(500).json({ success: false, message: "Error al eliminar usuario", error });
    }
};