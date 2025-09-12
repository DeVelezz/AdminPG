Usuario.hasOne(Residente, { foreignKey: "usuario_id", onDelete: "CASCADE" });
Residente.belongsTo(Usuario, { foreignKey: "usuario_id" });

Propiedad.hasMany(Residente, { foreignKey: "propiedad_id", onDelete: "CASCADE" });
Residente.belongsTo(Propiedad, { foreignKey: "propiedad_id" });
