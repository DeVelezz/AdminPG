require('dotenv').config();
const { sequelize, connectDB } = require('../src/config/db');
const Servicio = require('../src/models/servicio');
const Residente = require('../src/models/resident');

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function randomAmount() {
  return (Math.floor(Math.random() * 900000) + 10000) / 100; // entre 100.00 y 9000.00
}

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function seedRandom(limit = 50) {
  try {
    await connectDB();
    await sequelize.sync();

    const residentes = await Residente.findAll({ limit, order: [['id','ASC']] });
    if (!residentes || residentes.length === 0) {
      console.log('No hay residentes para asignar servicios.');
      process.exit(0);
    }

    // Limpiar servicios existentes de estos residentes
    const residenteIds = residentes.map(r => r.id);
    await Servicio.destroy({ where: { residente_id: residenteIds } });

    const hoy = new Date();
    let created = 0;

    for (const r of residentes) {
      const servicesCount = randInt(1,3);
      for (let s = 0; s < servicesCount; s++) {
        // Elegir estado aleatorio
        const p = Math.random();
        let tipo;
        if (p < 0.33) tipo = 'mora';
        else if (p < 0.66) tipo = 'por_vencer';
        else tipo = 'al_dia';

        if (tipo === 'mora') {
          const diasPasados = randInt(2,20);
          const venc = new Date(hoy); venc.setDate(hoy.getDate() - diasPasados);
          await Servicio.create({
            nombre: 'Cuota - Mora',
            monto: randomAmount(),
            fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - randInt(20,60))),
            fecha_vencimiento: formatDate(venc),
            numero_factura: `MORA-${r.id}-${Date.now()}-${s}`,
            fecha_pago: null,
            residente_id: r.id
          });
        } else if (tipo === 'por_vencer') {
          const dias = randInt(1,5);
          const venc = new Date(hoy); venc.setDate(hoy.getDate() + dias);
          await Servicio.create({
            nombre: 'Cuota - Por vencer',
            monto: randomAmount(),
            fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - randInt(1,5))),
            fecha_vencimiento: formatDate(venc),
            numero_factura: `PV-${r.id}-${Date.now()}-${s}`,
            fecha_pago: null,
            residente_id: r.id
          });
        } else {
          // al dia: la mitad con pago, la otra mitad con vencimiento lejos
          const venc = new Date(hoy); venc.setDate(hoy.getDate() + randInt(15,90));
          const pago = (Math.random() < 0.6) ? formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - randInt(1,10))) : null;
          await Servicio.create({
            nombre: 'Cuota - Al día',
            monto: randomAmount(),
            fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - randInt(1,15))),
            fecha_vencimiento: formatDate(venc),
            numero_factura: `AD-${r.id}-${Date.now()}-${s}`,
            fecha_pago: pago,
            residente_id: r.id
          });
        }

        created++;
      }
    }

    console.log(`Seed random completado. Servicios creados: ${created} para ${residentes.length} residentes.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seedRandom:', err);
    process.exit(1);
  }
}

seedRandom(50);
