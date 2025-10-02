const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./src/config/db');
const userRoutes = require('./src/routes/userRoutes');
const servicioRoutes = require('./src/routes/servicioRoutes'); // NUEVO
const pagoRoutes = require('./src/routes/pagoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api', userRoutes);
app.use('/api/servicios', servicioRoutes); // NUEVO
app.use('/api/pagos', pagoRoutes);

// Conectar y sincronizar con la base de datos solo si hay credenciales configuradas
if (process.env.DB_NAME && process.env.DB_USER) {
    connectDB();

    // Sincronizar modelos con la base de datos
        (async () => {
            try {
                await sequelize.sync({ alter: true });
                console.log("Modelos sincronizados con la base de datos. ✅");
            } catch (err) {
                // Detectar error conocido de MySQL al intentar crear demasiados índices
                const msg = err && (err.sqlMessage || err.message || '');
                if (msg && msg.includes('Too many keys specified')) {
                    console.warn('Fallo al aplicar ALTER por límite de índices (ER_TOO_MANY_KEYS). Reintentando sin alter para evitar cambios de esquema.');
                    try {
                        await sequelize.sync();
                        console.log('Modelos sincronizados sin ALTER. Arranque completado. ✅');
                    } catch (err2) {
                        console.error('Error al sincronizar modelos (fallback sin alter):', err2);
                    }
                } else {
                    console.error('Error al sincronizar modelos:', err);
                }
            }
        })();
} else {
    console.warn("Variables de entorno de la BD no detectadas. Se omitirá la conexión/sincronización con la base de datos.");
}

// Verificar conexión a la base de datos
app.get('/api/test', (req, res) => {
    res.json('API funcionando correctamente! 🚀');
});

app.listen(PORT, async () => {
    console.log(`Servidor escuchando http://localhost:${PORT} 🚀`);
});