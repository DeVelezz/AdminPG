const express = require('express');
const user = require('../controllers/user');
const router = express.Router();

router.post('/registro', user.createUser);

// rutas
// router.get("/", user.getAll);       // GET /api/
// router.get("/:id", user.getById);   // GET /api/:id
// router.put("/:id", user.update);    // PUT /api/:id
// router.delete("/:id", user.delete); // DELETE /api/:id

module.exports = router;