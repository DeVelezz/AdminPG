const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Propiedad = require("./Propiedad");
const Usuario = require("./user");

const Residente = sequelize.define("Residente", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  telefono: { type: DataTypes.STRING },
}, {
  tableName: "residentes",
  timestamps: true,
  createdAt: "fecha_creacion",
  updatedAt: "fecha_actualizacion"
});

// Relaciones
// Usuario.hasOne(Residente, { foreignKey: "usuario_id", onDelete: "CASCADE" });
// Residente.belongsTo(Usuario, { foreignKey: "usuario_id", onDelete: "CASCADE" });

// Propiedad.hasMany(Residente, { foreignKey: "propied                   ad_id", onDelete: "CASCADE" });
// Residente.belongsTo(Propiedad, { foreignKey: "propiedad_id", onDelete: "CASCADE" });

module.exports = Residente;
