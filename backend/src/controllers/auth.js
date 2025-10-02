const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Usuario = require('../models/user');
const Residente = require('../models/resident');

exports.login = async (req, res) => {
    if (process.env.NODE_ENV !== 'production') console.log('📥 Datos recibidos en backend:', req.body);
    
    const { email, contraseña, contrasena, password } = req.body;
    const pwd = contraseña || contrasena || password;

    try {
        if (!email || !pwd) {
            if (process.env.NODE_ENV !== 'production') console.log('❌ Faltan campos');
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const usuario = await Usuario.findOne({ where: { email } });
    if (process.env.NODE_ENV !== 'production') console.log('🔍 Usuario encontrado:', usuario ? 'SÍ' : 'NO');

        if (!usuario) {
            if (process.env.NODE_ENV !== 'production') console.log('❌ Usuario no existe en BD');
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

    const contraseñaValida = await bcrypt.compare(pwd, usuario.contraseña);
    if (process.env.NODE_ENV !== 'production') console.log('🔐 Contraseña válida:', contraseñaValida);
        
        if (!contraseñaValida) {
            if (process.env.NODE_ENV !== 'production') console.log('❌ Contraseña incorrecta');
            return res.status(400).json({ error: 'Contraseña incorrecta' });
        }

        // Buscar datos del residente
        const residente = await Residente.findOne({ 
            where: { usuario_id: usuario.id } 
        });
    if (process.env.NODE_ENV !== 'production') console.log('👤 Residente encontrado:', residente ? 'SÍ' : 'NO');

        const token = jwt.sign({
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        }, process.env.JWT_SECRET || 'tu_secreto_jwt', { expiresIn: '8h' });

        return res.json({
            msg: 'Login exitoso',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                residente_id: residente?.id,
                telefono: residente?.telefono,
                apartamento: residente?.apartamento,
                torre: residente?.torre,
                genero: residente?.genero
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({ error: 'Error en el servidor' });
    }
};