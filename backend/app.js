const express = require('express');
const cors = require('cors');
const { connectDB, sequelize } = require('./src/config/db');
const userRoutes = require('./src/routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);
connectDB();

// sincronizar modelos con la base de datos
sequelize.sync({ alter: true })
    .then(() => console.log("Modelos sincronizados con la base de datos. ✅"))
    .catch(err => console.error("Error al sincronizar modelos:", err));



// verificar conexion a la base de datos
app.get('/api/test', (req, res)=>{
    res.json('API funcionando correctamente! 🚀');
});

app.listen(PORT, async ()=>{
    console.log(`Servidor escuchando http://localhost:${PORT} 🚀`);
})