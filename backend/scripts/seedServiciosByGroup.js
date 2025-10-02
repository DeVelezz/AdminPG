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

async function seedByGroup(limit = 50) {
  try {
    await connectDB();
    await sequelize.sync();

    const residentes = await Residente.findAll({ limit, order: [['id','ASC']] });
    if (!residentes || residentes.length === 0) {
      console.log('No hay residentes para asignar servicios.');
      process.exit(0);
    }

    // Limpiar servicios existentes de estos residentes para evitar mezclas
    const residenteIds = residentes.map(r => r.id);
    await Servicio.destroy({ where: { residente_id: residenteIds } });

    const total = residentes.length;
    const groupSize = Math.ceil(total / 3);

    const hoy = new Date();

    for (let i = 0; i < total; i++) {
      const r = residentes[i];
      const idx = i;

      // Decide grupo: 0 -> En mora, 1 -> Por vencer, 2 -> Al dia
      const group = Math.floor(idx / groupSize);

      if (group === 0) {
        // EN MORA: crear 1-2 servicios con vencimiento en el pasado, sin pago
        const pastDays = 5 + (idx % 10); // variación
        const venc = new Date(hoy); venc.setDate(hoy.getDate() - pastDays);
        await Servicio.create({
          nombre: 'Cuota en mora',
          monto: randomAmount(),
          fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 30)),
          fecha_vencimiento: formatDate(venc),
          numero_factura: `MORA-${r.id}-${Date.now()}`,
          fecha_pago: null,
          residente_id: r.id
        });

        if (idx % 2 === 0) {
          const venc2 = new Date(hoy); venc2.setDate(hoy.getDate() - (pastDays + 7));
          await Servicio.create({
            nombre: 'Cuota en mora adicional',
            monto: randomAmount(),
            fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 60)),
            fecha_vencimiento: formatDate(venc2),
            numero_factura: `MORA2-${r.id}-${Date.now()}`,
            fecha_pago: null,
            residente_id: r.id
          });
        }

      } else if (group === 1) {
        // POR VENCER: vencimiento dentro de 1-5 dias, sin pago
        const inDays = 1 + (idx % 5);
        const venc = new Date(hoy); venc.setDate(hoy.getDate() + inDays);
        await Servicio.create({
          nombre: 'Cuota por vencer',
          monto: randomAmount(),
          fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 2)),
          fecha_vencimiento: formatDate(venc),
          numero_factura: `PV-${r.id}-${Date.now()}`,
          fecha_pago: null,
          residente_id: r.id
        });

      } else {
        // AL DÍA: crear servicio pagado (fecha_pago) o vencimiento lejano
        const venc = new Date(hoy); venc.setDate(hoy.getDate() + 30 + (idx % 7));
        const pago = new Date(hoy); pago.setDate(hoy.getDate() - (idx % 5));
        await Servicio.create({
          nombre: 'Cuota al día',
          monto: randomAmount(),
          fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 5)),
          fecha_vencimiento: formatDate(venc),
          numero_factura: `AD-${r.id}-${Date.now()}`,
          fecha_pago: formatDate(pago),
          residente_id: r.id
        });
      }
    }

    console.log(`Seed servicios por grupos completado. Procesados: ${total} residentes.`);
    process.exit(0);
  } catch (err) {
    console.error('Error seedByGroup:', err);
    process.exit(1);
  }
}

seedByGroup(50);
