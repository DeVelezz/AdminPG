const { DataTypes } = require("sequelize");
const {sequelize} = require("../config/db");

const Usuario = sequelize.define("Usuario", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  contraseña: { type: DataTypes.STRING, allowNull: false },
  rol: { type: DataTypes.STRING, defaultValue: "residente" }
}, {
  tableName: "usuarios",
  timestamps: true, // Sequelize agrega createdAt y updatedAt
  createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion"
});

module.exports = Usuario;
