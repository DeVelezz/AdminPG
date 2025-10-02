// Inicializar y exportar modelos para que las asociaciones queden disponibles
const { sequelize } = require('../config/db');
const Usuario = require('./user');
const Residente = require('./resident');
const Propiedad = require('./propiedad');
const Servicio = require('./servicio');

// Relaciones Usuario <-> Residente
Usuario.hasOne(Residente, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });
Residente.belongsTo(Usuario, { foreignKey: 'usuario_id', onDelete: 'CASCADE' });

// Relaciones Propiedad <-> Residente
Propiedad.hasMany(Residente, { foreignKey: 'propiedad_id', onDelete: 'CASCADE' });
Residente.belongsTo(Propiedad, { foreignKey: 'propiedad_id', onDelete: 'CASCADE' });

// Relaciones Residente <-> Servicio
Residente.hasMany(Servicio, { foreignKey: 'residente_id', onDelete: 'CASCADE' });
Servicio.belongsTo(Residente, { foreignKey: 'residente_id' });

module.exports = { sequelize, Usuario, Residente, Propiedad, Servicio };
