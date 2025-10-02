const bcrypt = require('bcrypt');
require('dotenv').config();
const { sequelize, connectDB } = require('../src/config/db');
const Usuario = require('../src/models/user');
const Residente = require('../src/models/resident');
const Propiedad = require('../src/models/propiedad');

async function seed() {
  try {
    // Conectar DB
    await connectDB();

    // Asegurar sincronización mínima (no forzar drop)
    await sequelize.sync();

    // Crear algunas propiedades
    const propiedades = await Promise.all([
      Propiedad.create({ numTorre: 'A', numApart: '101' }),
      Propiedad.create({ numTorre: 'A', numApart: '102' }),
      Propiedad.create({ numTorre: 'B', numApart: '201' }),
      Propiedad.create({ numTorre: 'B', numApart: '202' })
    ]);

    // Usuarios de ejemplo
    const plainUsers = [
      { nombre: 'María Gonzalez', email: 'maria.gonzalez@example.com', password: 'Passw0rd!' , rol: 'residente'},
      { nombre: 'Carlos Pérez', email: 'carlos.perez@example.com', password: 'Passw0rd!' , rol: 'residente'},
      { nombre: 'Lucía Ramírez', email: 'lucia.ramirez@example.com', password: 'Passw0rd!' , rol: 'residente'},
      { nombre: 'Admin Principal', email: 'admin@example.com', password: 'AdminPass123!', rol: 'administrador' }
    ];

    // Insertar usuarios con contraseña hasheada
    const saltRounds = 10;
    const createdUsers = [];
    for (const u of plainUsers) {
      const hash = await bcrypt.hash(u.password, saltRounds);
      const usuario = await Usuario.create({ nombre: u.nombre, email: u.email, contraseña: hash, rol: u.rol });
      createdUsers.push(usuario);
    }

    // Asociar residentes a algunas propiedades
    await Residente.create({ usuario_id: createdUsers[0].id, propiedad_id: propiedades[0].id, telefono: '3001112222', apartamento: '101', torre: 'A', genero: 'femenino' });
    await Residente.create({ usuario_id: createdUsers[1].id, propiedad_id: propiedades[1].id, telefono: '3003334444', apartamento: '102', torre: 'A', genero: 'masculino' });
    await Residente.create({ usuario_id: createdUsers[2].id, propiedad_id: propiedades[2].id, telefono: '3005556666', apartamento: '201', torre: 'B', genero: 'femenino' });

    console.log('Seed completado. Usuarios creados:', createdUsers.map(u => ({ id: u.id, email: u.email, rol: u.rol })));
    process.exit(0);
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  }
}

seed();
