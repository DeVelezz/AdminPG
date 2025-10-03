const Servicio = require('../models/servicio');
const Residente = require('../models/resident');

// Procesar pago desde residente
exports.procesarPagoResidente = async (req, res) => {
    try {
        const { servicioId, metodoPago, referencia, notas, monto } = req.body;
        const usuarioId = req.user.id; // Del token JWT
        if (process.env.NODE_ENV !== 'production') console.log('💳 procesarPagoResidente request by user:', usuarioId, 'body:', req.body);

        // Verificar que el servicio pertenezca al residente que corresponde al usuario logueado
        const residenteRecord = await Residente.findOne({ where: { usuario_id: usuarioId } });
        if (!residenteRecord) {
            return res.status(403).json({ error: 'Usuario no asociado a residente' });
        }
            if (process.env.NODE_ENV !== 'production') console.log('💳 Procesando pago de residente:', {
                servicioId,
                metodoPago,
                usuarioId
            });

        // Buscar el servicio
        const servicio = await Servicio.findByPk(servicioId);
        if (process.env.NODE_ENV !== 'production') console.log('🔎 Servicio encontrado para procesarPagoResidente:', servicio ? servicio.toJSON() : null);

        // Verificar que el servicio pertenezca al residente del usuario
        if (servicio && Number(servicio.residente_id) !== Number(residenteRecord.id)) {
            return res.status(403).json({ error: 'No tienes permisos para pagar este servicio' });
        }
        if (process.env.NODE_ENV !== 'production') console.log('🔎 Servicio encontrado para registrarPagoAdmin:', servicio ? servicio.toJSON() : null, 'residenteId esperado:', req.body.residenteId || null);
        // Si cliente proporcionó residenteId, verificar coincidencia
        if (req.body.residenteId && servicio && Number(req.body.residenteId) !== Number(servicio.residente_id)) {
            return res.status(400).json({ error: 'El servicio no pertenece al residente indicado' });
        }
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Verificar que el servicio no esté ya pagado
        if (servicio.fecha_pago) {
            return res.status(400).json({ error: 'Este servicio ya fue pagado' });
        }

        // Actualizar el servicio con los datos del pago
        await servicio.update({
            fecha_pago: new Date(),
            metodo_pago: metodoPago,
            referencia: referencia,
            notas: notas
        });

            if (process.env.NODE_ENV !== 'production') console.log('✅ Pago procesado exitosamente');

        return res.json({
            success: true,
            msg: 'Pago procesado exitosamente',
            servicio: {
                id: servicio.id,
                nombre: servicio.nombre,
                monto: servicio.monto,
                fecha_pago: servicio.fecha_pago,
                metodo_pago: servicio.metodo_pago,
                referencia: servicio.referencia
            }
        });

    } catch (error) {
        console.error('❌ Error al procesar pago:', error);
        return res.status(500).json({ 
            error: 'Error al procesar el pago',
            detalles: error.message 
        });
    }
};

// Registrar pago desde administrador
exports.registrarPagoAdmin = async (req, res) => {
    try {
        const { servicioId, metodoPago, fechaPago, notas, monto } = req.body;
        const adminId = req.user.id; // Del token JWT

            if (process.env.NODE_ENV !== 'production') console.log('👨‍💼 Registrando pago por administrador:', {
                servicioId,
                metodoPago,
                adminId
            });

        // Verificar que el usuario sea admin (aceptar sinónimos)
        const rolUsuario = String(req.user.rol || '').toLowerCase();
        const rolesAdminAceptados = ['administrador', 'admin', 'administrator'];
        if (!rolesAdminAceptados.includes(rolUsuario)) {
            return res.status(403).json({ 
                error: 'No tienes permisos para realizar esta acción' 
            });
        }

    // Buscar el servicio
    const servicio = await Servicio.findByPk(servicioId);
    if (process.env.NODE_ENV !== 'production') console.log('🔎 Servicio encontrado para registrarPagoAdmin:', servicio ? servicio.toJSON() : null, 'residenteId esperado:', req.body.residenteId || null);
        if (!servicio) {
            return res.status(404).json({ error: 'Servicio no encontrado' });
        }

        // Validar método de pago permitido para admin
        const metodoLower = String(metodoPago || '').toLowerCase();
        const metodosAdminPermitidos = ['efectivo', 'transferencia'];
        if (metodoPago && !metodosAdminPermitidos.includes(metodoLower)) {
            return res.status(400).json({ error: 'Método de pago no permitido para administrador' });
        }

        // Actualizar el servicio con los datos del pago
        const updatePayload = {
            fecha_pago: fechaPago,
            metodo_pago: metodoPago,
            notas: notas
        };
        // Si el admin envía un monto (pago parcial o distinto), actualizarlo también
        if (monto !== undefined && monto !== null && monto !== '') {
            // intentar convertir a número
            const montoNum = Number(monto);
            if (!isNaN(montoNum)) updatePayload.monto = montoNum;
        }

        await servicio.update(updatePayload);

            if (process.env.NODE_ENV !== 'production') console.log('✅ Pago registrado exitosamente por admin');

        return res.json({
            success: true,
            msg: 'Pago registrado exitosamente',
            servicio: {
                id: servicio.id,
                nombre: servicio.nombre,
                monto: servicio.monto,
                fecha_pago: servicio.fecha_pago,
                metodo_pago: servicio.metodo_pago
            }
        });

    } catch (error) {
        console.error('❌ Error al registrar pago:', error);
        return res.status(500).json({ 
            error: 'Error al registrar el pago',
            detalles: error.message 
        });
    }
};

// Deshacer pago (solo admin) - deja fecha_pago, metodo_pago, referencia y notas en null
exports.deshacerPagoAdmin = async (req, res) => {
    try {
        const servicioId = req.params.servicioId;
        // Verificar rol admin
        const rolUsuario = String(req.user.rol || '').toLowerCase();
        const rolesAdminAceptados = ['administrador', 'admin', 'administrator'];
        if (!rolesAdminAceptados.includes(rolUsuario)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
        }

        const servicio = await Servicio.findByPk(servicioId);
        if (!servicio) return res.status(404).json({ error: 'Servicio no encontrado' });

        if (process.env.NODE_ENV !== 'production') console.log('🧾 Deshaciendo pago servicio:', servicioId, 'usuario admin:', req.user.id);

        servicio.fecha_pago = null;
        servicio.metodo_pago = null;
        servicio.referencia = null;
        servicio.notas = servicio.notas; // conservar notas si se quiere; dejar igual

        await servicio.save();

        return res.json({ success: true, msg: 'Pago deshecho correctamente', servicio: servicio });
    } catch (error) {
        console.error('❌ Error al deshacer pago:', error);
        return res.status(500).json({ error: 'Error al deshacer pago', detalles: error.message });
    }
};

// Obtener historial de pagos de un residente
exports.getHistorialPagos = async (req, res) => {
    try {
        const { residenteId } = req.params;

            if (process.env.NODE_ENV !== 'production') console.log('📋 Obteniendo historial de pagos para residente:', residenteId);

        const serviciosPagados = await Servicio.findAll({
            where: { 
                residente_id: residenteId,
                fecha_pago: { [require('sequelize').Op.ne]: null }
            },
            order: [['fecha_pago', 'DESC']]
        });

            if (process.env.NODE_ENV !== 'production') console.log(`✅ Se encontraron ${serviciosPagados.length} pagos`);

        return res.json(serviciosPagados);

    } catch (error) {
        console.error('❌ Error al obtener historial:', error);
        return res.status(500).json({ 
            error: 'Error al obtener historial de pagos',
            detalles: error.message 
        });
    }
};