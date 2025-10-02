const { Sequelize } = require('sequelize')
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: false,
    define:{
        timestamps: true
    }
});

async function connectDB() {
    try {
        if (!process.env.DB_NAME || !process.env.DB_USER) {
            throw new Error("⚠️ Faltan variables de entorno para la conexión a la BD");
        }
            await sequelize.authenticate();
            if (process.env.NODE_ENV !== 'production') console.log('Conexion a la base de datos establecida exitosamente.✅👌');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
}

module.exports = { sequelize, connectDB };