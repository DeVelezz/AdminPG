// Importar modelos desde el index que inicializa asociaciones
const { Servicio, Residente, Usuario } = require('../models');

// Crear un nuevo servicio/cobro
exports.createServicio = async (req, res) => {
    try {
        const { 
            nombre, 
            monto, 
            fecha_generacion, 
            fecha_vencimiento, 
            numero_factura,
            residente_id,
            aplicarATodos 
        } = req.body;

        // Validar campos requeridos
        if (!nombre || !monto || !fecha_generacion || !fecha_vencimiento) {
            return res.status(400).json({ 
                success: false, 
                message: "Faltan campos requeridos" 
            });
        }

        // Si se aplica a todos los residentes
        if (aplicarATodos) {
            const residentes = await Residente.findAll();
            
            const servicios = await Promise.all(
                residentes.map((residente) => 
                    Servicio.create({
                        nombre,
                        monto,
                        fecha_generacion,
                        fecha_vencimiento,
                        numero_factura: numero_factura ? `${numero_factura}-${residente.id}` : null,
                        residente_id: residente.id,
                        fecha_pago: null,
                        metodo_pago: null,
                        referencia: null
                    })
                )
            );

            return res.status(201).json({ 
                success: true, 
                message: `Servicio creado para ${servicios.length} residentes`, 
                data: servicios 
            });
        }

        // Si se aplica a un residente específico
        if (!residente_id) {
            return res.status(400).json({ 
                success: false, 
                message: "Debe especificar un residente o aplicar a todos" 
            });
        }

        const servicio = await Servicio.create({
            nombre,
            monto,
            fecha_generacion,
            fecha_vencimiento,
            numero_factura,
            residente_id,
            fecha_pago: null,
            metodo_pago: null,
            referencia: null
        });

        return res.status(201).json({ 
            success: true, 
            message: "Servicio creado exitosamente", 
            data: servicio 
        });

    } catch (error) {
        console.error("Error al crear servicio:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al crear servicio", 
            error: error.message 
        });
    }
};

// Obtener todos los servicios de un residente
exports.getServiciosByResidente = async (req, res) => {
    try {
        const { residente_id } = req.params;

        const servicios = await Servicio.findAll({
            where: { residente_id },
            order: [['fecha_generacion', 'DESC']]
        });

        // Normalizar fecha_pago en la respuesta: convertir '' / '0000-00-00' / 'null' / '0' a null
        const serviciosNormalizados = (Array.isArray(servicios) ? servicios : []).map(s => {
            const obj = (typeof s.toJSON === 'function') ? s.toJSON() : { ...s };
            const raw = obj.fecha_pago;
            if (raw === undefined || raw === null) {
                obj.fecha_pago = null;
            } else {
                const str = String(raw).trim();
                if (str === '' || str === '0000-00-00' || str.toLowerCase() === 'null' || str === '0') {
                    obj.fecha_pago = null;
                }
            }
            // Campo auxiliar: fecha normalizada y bandera booleana para facilitar al frontend
            obj.fecha_pago_normalizada = obj.fecha_pago; // null o string válido
            obj.is_paid = !!obj.fecha_pago_normalizada;
            
            // Asegurar que metodo_pago y referencia estén presentes (null si vacíos)
            obj.metodo_pago = obj.metodo_pago || null;
            obj.referencia = obj.referencia || null;
            obj.notas = obj.notas || null;
            
            return obj;
        });

        return res.status(200).json({ 
            success: true, 
            data: serviciosNormalizados 
        });

    } catch (error) {
        console.error("Error al obtener servicios:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al obtener servicios", 
            error: error.message 
        });
    }
};

// Obtener todos los servicios (admin)
exports.getAllServicios = async (req, res) => {
    try {
        const servicios = await Servicio.findAll({
            include: [{
                model: Residente,
                include: [Usuario]
            }],
            order: [['fecha_generacion', 'DESC']]
        });

        return res.status(200).json({ 
            success: true, 
            data: servicios 
        });

    } catch (error) {
        console.error("Error al obtener servicios:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al obtener servicios", 
            error: error.message 
        });
    }
};

// Actualizar un servicio
exports.updateServicio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, monto, fecha_vencimiento } = req.body;

        const servicio = await Servicio.findByPk(id);

        if (!servicio) {
            return res.status(404).json({ 
                success: false, 
                message: "Servicio no encontrado" 
            });
        }

        servicio.nombre = nombre || servicio.nombre;
        servicio.monto = monto || servicio.monto;
        servicio.fecha_vencimiento = fecha_vencimiento || servicio.fecha_vencimiento;

        await servicio.save();

        return res.status(200).json({ 
            success: true, 
            message: "Servicio actualizado exitosamente", 
            data: servicio 
        });

    } catch (error) {
        console.error("Error al actualizar servicio:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al actualizar servicio", 
            error: error.message 
        });
    }
};

// Eliminar un servicio
exports.deleteServicio = async (req, res) => {
    try {
        const { id } = req.params;

        const servicio = await Servicio.findByPk(id);

        if (!servicio) {
            return res.status(404).json({ 
                success: false, 
                message: "Servicio no encontrado" 
            });
        }

        await servicio.destroy();

        return res.status(200).json({ 
            success: true, 
            message: "Servicio eliminado exitosamente" 
        });

    } catch (error) {
        console.error("Error al eliminar servicio:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Error al eliminar servicio", 
            error: error.message 
        });
    }
};

// Obtener residentes en mora (servicios sin fecha de pago y vencidos)
const { QueryTypes } = require('sequelize');
exports.getMorosos = async (req, res) => {
    try {
        // Usamos una consulta agregada para devolver por residente:
        // - deudaTotal: SUM(monto)
        // - ultimoVencimiento: MAX(fecha_vencimiento)
        // Solo servicios con fecha_pago IS NULL y fecha_vencimiento < CURDATE()

        const query = `
            SELECT
                r.id AS residente_id,
                u.id AS usuario_id,
                COALESCE(u.nombre, u.email, CONCAT('Residente ', r.id)) AS nombre,
                u.email AS email,
                r.telefono AS telefono,
                r.torre AS torre,
                r.apartamento AS apartamento,
                SUM(s.monto) AS deudaTotal,
                MAX(s.fecha_vencimiento) AS ultimoVencimiento,
                DATEDIFF(CURDATE(), MAX(s.fecha_vencimiento)) AS diasVencimiento
            FROM servicios s
            JOIN residentes r ON r.id = s.residente_id
            LEFT JOIN usuarios u ON u.id = r.usuario_id
                        -- Tratar valores vacíos o '0000-00-00' como no pagado
                        WHERE (
                                s.fecha_pago IS NULL
                                OR TRIM(s.fecha_pago) = ''
                                OR s.fecha_pago = '0000-00-00'
                                OR LOWER(TRIM(s.fecha_pago)) = 'null'
                                OR TRIM(s.fecha_pago) = '0'
                        )
                            AND s.fecha_vencimiento < CURDATE()
            GROUP BY r.id, u.id, u.nombre, u.email, r.telefono, r.torre, r.apartamento
            HAVING deudaTotal > 0
            ORDER BY deudaTotal DESC
            LIMIT 1000
        `;

        // Ejecutar consulta como SELECT -> devuelve array de filas
        const results = await Servicio.sequelize.query(query, { type: QueryTypes.SELECT });

        // Normalizar tipos (DECIMAL -> Number)
        const morosos = (Array.isArray(results) ? results : []).map(r => ({
            residente_id: r.residente_id,
            usuario_id: r.usuario_id,
            nombre: r.nombre,
            email: r.email,
            telefono: r.telefono,
            torre: r.torre,
            apartamento: r.apartamento,
            deudaTotal: Number(r.deudaTotal || 0),
            ultimoVencimiento: r.ultimoVencimiento,
            diasVencimiento: Number(r.diasVencimiento || 0)
        }));

        return res.status(200).json({ success: true, data: morosos });
    } catch (error) {
        console.error('Error al obtener morosos (SQL):', error);
        return res.status(500).json({ success: false, message: 'Error al obtener morosos', error: error.message });
    }
};