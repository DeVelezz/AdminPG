const bcrypt = require('bcrypt');
require('dotenv').config();
const { sequelize, connectDB } = require('../src/config/db');
const Usuario = require('../src/models/user');
const Residente = require('../src/models/resident');
const Propiedad = require('../src/models/propiedad');

function randomPhone() {
  const n = () => Math.floor(Math.random() * 9) + 1;
  return `3${n()}${Math.floor(1000000 + Math.random() * 8999999)}`;
}

async function seedMany(count = 50) {
  try {
    await connectDB();
    await sequelize.sync();

    const saltRounds = 10;
    const created = [];

    for (let i = 0; i < count; i++) {
      const nombre = `Residente ${Date.now().toString().slice(-5)}-${i}`;
      const email = `residente${Date.now().toString().slice(-5)}${i}@example.com`;
      const password = 'Passw0rd!';

      // Evitar duplicados por email
      const existing = await Usuario.findOne({ where: { email } });
      if (existing) continue;

      const hash = await bcrypt.hash(password, saltRounds);
      const usuario = await Usuario.create({ nombre, email, contraseña: hash, rol: 'residente' });

      // Crear o reutilizar una propiedad aleatoria
      const torre = Math.random() > 0.5 ? 'A' : 'B';
      const num = Math.floor(Math.random() * 200) + 1;
      const propiedad = await Propiedad.create({ numTorre: torre, numApart: `${num}` });

      await Residente.create({ usuario_id: usuario.id, propiedad_id: propiedad.id, telefono: randomPhone(), apartamento: `${num}`, torre, genero: Math.random() > 0.5 ? 'femenino' : 'masculino' });

      created.push({ id: usuario.id, email });
    }

    console.log(`Seed many completado. Creado: ${created.length} usuarios.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seedMany:', err);
    process.exit(1);
  }
}

seedMany(50);
