const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Propiedad = require("./propiedad");
const Usuario = require("./user");

const Residente = sequelize.define("Residente", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: false },
  propiedad_id: { type: DataTypes.INTEGER, allowNull: true },
  telefono: { type: DataTypes.STRING },
  apartamento: { type: DataTypes.STRING },
  torre: { type: DataTypes.STRING },
  genero: { type: DataTypes.ENUM('masculino', 'femenino'), defaultValue: 'masculino' },
}, {
  tableName: "residentes",
  timestamps: true,
  createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion"
});

// Relaciones
Usuario.hasOne(Residente, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Residente.belongsTo(Usuario, { foreignKey: "usuario_id", onDelete: "CASCADE" });

Propiedad.hasMany(Residente, { foreignKey: "propiedad_id", onDelete: "CASCADE" });
Residente.belongsTo(Propiedad, { foreignKey: "propiedad_id", onDelete: "CASCADE" });

module.exports = Residente;