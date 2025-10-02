const Usuario = require('../models/user');
const bcrypt = require('bcrypt');

exports.createDefaultAdmin = async (req, res) => {
  // Permitir solo en desarrollo o si la variable ENABLE_DEBUG está activada
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG !== 'true') {
    return res.status(403).json({ error: 'Operación no permitida en producción' });
  }

  const email = req.body.email || 'admin@admin.local';
  const password = req.body.password || 'Admin12345';
  const nombre = req.body.nombre || 'Administrador';

  try {
    const existing = await Usuario.findOne({ where: { email } });
    if (existing) {
      return res.json({ success: true, message: 'Admin ya existe', data: { id: existing.id, email: existing.email } });
    }

    const hashed = await bcrypt.hash(password, 10);
    const admin = await Usuario.create({ nombre, email, contraseña: hashed, rol: 'administrador' });

    return res.json({ success: true, message: 'Admin creado', data: { id: admin.id, email: admin.email } });
  } catch (error) {
    console.error('Error creando admin de prueba:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
