const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/user');
const Residente = require('../models/resident');
const Servicio = require('../models/servicio');

// Registro de usuario residente
exports.createUser = async (req, res) => {
    try {
        const { nombre, email, contraseña, contrasena, password, telefono, torre, apartamento, genero } = req.body;
        const pwd = contraseña || contrasena || password;

        if (!nombre || !email || !pwd || !telefono || !torre || !apartamento) {
            return res.status(400).json({ 
                success: false, 
                message: "Faltan campos requeridos" 
            });
        }

        const existingUser = await Usuario.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "Email ya registrado" 
            });
        }

    const hashedPassword = await bcrypt.hash(pwd, 10);

        const usuario = await Usuario.create({
            nombre,
            email,
            contraseña: hashedPassword,
            rol: 'residente'
        });

        const residente = await Residente.create({
            telefono,
            torre,
            apartamento,
            genero: genero || 'masculino',
            usuario_id: usuario.id
        });

        return res.status(201).json({ 
            success: true, 
            message: "Residente registrado exitosamente", 
            data: { usuario, residente } 
        });

    } catch (error) {
        console.error("Error al registrar residente:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al registrar residente", 
            error: error.message 
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, contraseña, contrasena, password } = req.body;
        const pwd = contraseña || contrasena || password;

        if (!email || !pwd) {
            return res.status(400).json({ 
                success: false, 
                message: "Email y contraseña son requeridos" 
            });
        }

        const usuario = await Usuario.findOne({ 
            where: { email },
            include: [{
                model: Residente,
                attributes: ['id', 'telefono', 'torre', 'apartamento', 'genero']
            }]
        });

        if (!usuario) {
            return res.status(401).json({ 
                success: false, 
                message: "Credenciales inválidas" 
            });
        }

    const contraseñaValida = await bcrypt.compare(pwd, usuario.contraseña);

        if (!contraseñaValida) {
            return res.status(401).json({ 
                success: false, 
                message: "Credenciales inválidas" 
            });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET || 'tu_secreto_jwt',
            { expiresIn: '24h' }
        );

        const usuarioData = {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };

        if (usuario.Residente) {
            usuarioData.residente_id = usuario.Residente.id;
            usuarioData.telefono = usuario.Residente.telefono;
            usuarioData.torre = usuario.Residente.torre;
            usuarioData.apartamento = usuario.Residente.apartamento;
            usuarioData.genero = usuario.Residente.genero;
        }

        return res.status(200).json({ 
            success: true, 
            message: "Login exitoso",
            token,
            usuario: usuarioData
        });

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error en el servidor", 
            error: error.message 
        });
    }
};

// Obtener todos los usuarios con sus datos de residente
exports.getAllUsers = async (req, res) => {
    try {
        const users = await Usuario.findAll({
            include: [{
                model: Residente,
                attributes: ['id', 'telefono', 'torre', 'apartamento', 'genero']
            }],
            attributes: { exclude: ['contraseña'] }
        });
        return res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al obtener usuarios", 
            error: error.message 
        });
    }
};

// Obtener usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findByPk(id, {
            include: [{
                model: Residente,
                attributes: ['id', 'telefono', 'torre', 'apartamento', 'genero']
            }],
            attributes: { exclude: ['contraseña'] }
        });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Usuario no encontrado" 
            });
        }
        
        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al obtener usuario", 
            error: error.message 
        });
    }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, contraseña, contrasena, password, telefono, torre, apartamento, genero } = req.body;
        const pwd = contraseña || contrasena || password;
        
        const user = await Usuario.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Usuario no encontrado" 
            });
        }
        
        user.nombre = nombre || user.nombre;
        user.email = email || user.email;
        
        if (pwd) {
            user.contraseña = await bcrypt.hash(pwd, 10);
        }
        
        await user.save();

        const residente = await Residente.findOne({ where: { usuario_id: id } });
        
        if (residente) {
            residente.telefono = telefono || residente.telefono;
            residente.torre = torre || residente.torre;
            residente.apartamento = apartamento || residente.apartamento;
            residente.genero = genero || residente.genero;
            await residente.save();
        }
        
        return res.status(200).json({ 
            success: true, 
            message: "Usuario actualizado exitosamente", 
            data: { user, residente } 
        });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al actualizar usuario", 
            error: error.message 
        });
    }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Usuario.findByPk(id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Usuario no encontrado" 
            });
        }
        // Buscar residente asociado
        const residente = await Residente.findOne({ where: { usuario_id: id } });

        if (residente) {
            // Eliminar servicios asociados al residente para evitar violaciones de FK
            try {
                await Servicio.destroy({ where: { residente_id: residente.id } });
            } catch (err) {
                console.error('Error eliminando servicios asociados:', err);
                // continuar intentando eliminar residente/usuario, pero reportar el error si falla
            }

            // Eliminar el registro de Residente
            try {
                await residente.destroy();
            } catch (err) {
                console.error('Error eliminando residente asociado:', err);
                return res.status(500).json({ success: false, message: 'Error al eliminar residente asociado', error: err.message });
            }
        }

        // Finalmente eliminar el usuario
        await user.destroy();

        return res.status(200).json({ 
            success: true, 
            message: "Usuario eliminado exitosamente" 
        });
    } catch (error) {
        console.error("Error al eliminar usuario:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al eliminar usuario", 
            error: error.message 
        });
    }
};