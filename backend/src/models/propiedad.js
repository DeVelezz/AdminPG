const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Propiedad = sequelize.define("Propiedad", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  numTorre: { type: DataTypes.STRING, allowNull: false },
  numApart: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: "propiedades",
  timestamps: true,
  createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion"
});

module.exports = Propiedad;
