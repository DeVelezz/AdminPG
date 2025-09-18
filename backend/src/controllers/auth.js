const jwt = require('jsonwebtoken');
const bycrypt = require('bcrypt');
const { User } = require('../models/user');

exports.login = async (req, res) => {
    const { email, contraseña } = req.body;

    try {
        const Usuario = await User.findOne({ where: { email } });

        if (!Usuario) {
            return res.status(400).json({ error: 'Usuario no encontrado' });
        }

        // creamos el token 
        const token = jwt.sign({
            id: Usuario.id,
            nombre: Usuario.nombre,
            email: Usuario.email,
            rol: Usuario.rol
        }, process.env.JWT_SECRET, { expiresIn: '8h' }
    );
    res.json({
        msg: 'Login exitoso',
        token,
        usuario: {
            id: Usuario.id,
            nombre: Usuario.nombre,
            email: Usuario.email,
            rol: Usuario.rol
        }
    })
    } catch (error) {

        if(!email || !contraseña){
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        console.error(error, msg='Error en el login');
    }
}
