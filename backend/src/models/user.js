const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Usuario = sequelize.define("Usuario", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  contraseña: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.ENUM('administrador', 'residente'), defaultValue: "residente" }
}, {
  tableName: "usuarios",
  timestamps: true,
  createdAt: "fecha_creacion",
  updatedAt: false // Elimina fecha_actualizacion si no existe en tu BD
});

module.exports = Usuario;