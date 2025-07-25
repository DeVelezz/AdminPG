const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize, connectDB} = require('./config/db');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

// Sesiones
app.use(session({
  secret: 'secreto_super_seguro',
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({ db: sequelize }),
}));

// Rutas
app.use('/api', userRoutes);

module.exports = app;
