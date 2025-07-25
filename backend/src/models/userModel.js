const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/db');

const User = sequelize.define('User', {
    nombre: DataTypes.STRING,
    correo: DataTypes.STRING,
    contrasena: DataTypes.STRING,
    rol: DataTypes.ENUM('residente', 'administrador')
}, {
    tableName: 'usuarios',
    timestamps: false, // Desactiva los timestamps automáticos de Sequelize
});

module.exports = User;