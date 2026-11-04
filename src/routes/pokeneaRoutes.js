const express = require('express');
const { mostrarPokenea } = require('../controllers/pokeneaController');

const router = express.Router();
router.get('/', mostrarPokenea);

module.exports = router;