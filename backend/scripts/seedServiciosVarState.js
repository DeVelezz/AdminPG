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

async function seedServicios() {
  try {
    await connectDB();
    await sequelize.sync();

    const residentes = await Residente.findAll({ limit: 30 });
    if (!residentes || residentes.length === 0) {
      console.log('No hay residentes para asignar servicios.');
      process.exit(0);
    }

    const hoy = new Date();

    for (let i = 0; i < residentes.length; i++) {
      const r = residentes[i];
      // Para cada residente crear 3 servicios: uno en mora, uno por vencer y uno al dia

      // EN MORA: vencimiento hace 10 dias
      const vencMora = new Date(hoy);
      vencMora.setDate(hoy.getDate() - 10 - i % 5);

      await Servicio.create({
        nombre: 'Cuota mensual - Mora',
        monto: randomAmount(),
        fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 40)),
        fecha_vencimiento: formatDate(vencMora),
        numero_factura: `M-${r.id}-${Date.now()}`,
        fecha_pago: null,
        residente_id: r.id
      });

      // POR VENCER: dentro de 3 dias
      const vencPorVencer = new Date(hoy);
      vencPorVencer.setDate(hoy.getDate() + 3 + (i % 3));

      await Servicio.create({
        nombre: 'Cuota mensual - Por vencer',
        monto: randomAmount(),
        fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1)),
        fecha_vencimiento: formatDate(vencPorVencer),
        numero_factura: `PV-${r.id}-${Date.now()}`,
        fecha_pago: null,
        residente_id: r.id
      });

      // AL DIA: vencimiento en 30 dias (pagado si i%4==0)
      const vencAlDia = new Date(hoy);
      vencAlDia.setDate(hoy.getDate() + 30 + (i % 7));
      const fechaPago = (i % 4 === 0) ? formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 2)) : null;

      await Servicio.create({
        nombre: 'Cuota mensual - Al día',
        monto: randomAmount(),
        fecha_generacion: formatDate(new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 2)),
        fecha_vencimiento: formatDate(vencAlDia),
        numero_factura: `AD-${r.id}-${Date.now()}`,
        fecha_pago: fechaPago,
        residente_id: r.id
      });
    }

    console.log('Seed servicios completado para residentes (3 por residente).');
    process.exit(0);
  } catch (err) {
    console.error('Error seed servicios:', err);
    process.exit(1);
  }
}

seedServicios();
