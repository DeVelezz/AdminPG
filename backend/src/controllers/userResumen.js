const Usuario = require('../models/user');
const Residente = require('../models/resident');
const Servicio = require('../models/servicio');
const { Op, fn, col } = require('sequelize');

// Devuelve usuarios con resumen de deuda y estado calculado
exports.getUsuariosConResumen = async (req, res) => {
    try {
        // Obtener todos los usuarios con su Residente
        const users = await Usuario.findAll({
            include: [{
                model: Residente,
                attributes: ['id', 'telefono', 'torre', 'apartamento']
            }],
            attributes: { exclude: ['contraseña'] }
        });

        // Obtener suma de montos pendientes por residente (fecha_pago IS NULL)
        const pendientes = await Servicio.findAll({
            attributes: [
                'residente_id',
                [fn('SUM', col('monto')), 'deudaTotal'],
                [fn('MAX', col('fecha_vencimiento')), 'ultimoVencimiento']
            ],
            where: {
                fecha_pago: null
            },
            group: ['residente_id']
        });

        // Además, obtener la suma de montos pendientes que ya están vencidos (fecha_vencimiento < hoy)
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const vencidos = await Servicio.findAll({
            attributes: [
                'residente_id',
                [fn('SUM', col('monto')), 'deudaVencida'],
                [fn('MAX', col('fecha_vencimiento')), 'ultimoVencVencido']
            ],
            where: {
                fecha_pago: null,
                fecha_vencimiento: { [Op.lt]: hoy }
            },
            group: ['residente_id']
        });

        // Map pendings por residente_id
        const mapaPendientes = {};
        pendientes.forEach(p => {
            const rid = p.get('residente_id');
            mapaPendientes[rid] = {
                deudaTotal: parseFloat(p.get('deudaTotal') || 0),
                ultimoVencimiento: p.get('ultimoVencimiento')
            };
        });

        // Map de vencidos (solo los que ya están vencidos)
        const mapaVencidos = {};
        vencidos.forEach(p => {
            const rid = p.get('residente_id');
            mapaVencidos[rid] = {
                deudaVencida: parseFloat(p.get('deudaVencida') || 0),
                ultimoVencVencido: p.get('ultimoVencVencido')
            };
        });

        // Construir respuesta combinada
        const resultado = users.map(u => {
            const r = u.Residente || {};
            const pendiente = mapaPendientes[r.id] || { deudaTotal: 0, ultimoVencimiento: null };
            const vencido = mapaVencidos[r.id] || { deudaVencida: 0, ultimoVencVencido: null };

            // Calcular estado:
            // - Si tiene deuda vencida (deudaVencida > 0) -> En mora
            // - Si tiene deuda total > 0 pero no vencida -> Por vencer
            // - Si no tiene deuda -> Al dia
            let estado = 'Al dia';
            const deuda = pendiente.deudaTotal || 0;
            const deudaVencida = vencido.deudaVencida || 0;

            if (deudaVencida > 0) {
                estado = 'En mora';
            } else if (deuda > 0) {
                estado = 'Por vencer';
            }

            // Preferir último vencimiento de las facturas vencidas si existe, sino usar el último vencimiento general
            const ultimoVencimientoFinal = (vencido.ultimoVencVencido || pendiente.ultimoVencimiento) || null;

            return {
                id: u.id,
                nombre: u.nombre,
                email: u.email,
                torre: r.torre || null,
                apartamento: r.apartamento || null,
                telefono: r.telefono || null,
                propiedad_id: r.id || null,
                deudaTotal: deuda,
                ultimoVencimiento: ultimoVencimientoFinal,
                estado
            };
        });

        return res.status(200).json({ success: true, data: resultado });

    } catch (error) {
        console.error('Error al obtener usuarios con resumen:', error);
        return res.status(500).json({ success: false, message: 'Error al obtener resumen', error: error.message });
    }
};
