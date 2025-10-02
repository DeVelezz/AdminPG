const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Servicio = sequelize.define('Servicio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    fecha_generacion: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'fecha_generacion'
    },
    fecha_vencimiento: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'fecha_vencimiento'
    },
    numero_factura: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'numero_factura'
    },
    fecha_pago: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        field: 'fecha_pago'
    },
    metodo_pago: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'metodo_pago'
    },
    referencia: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    residente_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'residente_id',
        references: {
            model: 'residentes',
            key: 'id'
        }
    }
}, {
    tableName: 'servicios',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
});

module.exports = Servicio;