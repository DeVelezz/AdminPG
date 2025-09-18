const jwt = require('jsonwebtoken');

const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).json({ msg: "Token requerido" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ahora puedes usar req.user en tus rutas
        next();
    } catch (err) {
        return res.status(401).json({ msg: "Token inválido o expirado" });
    }
};
