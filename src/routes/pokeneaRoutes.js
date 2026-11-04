const { Router } = require('express');
const pokeneaController = require('../controllers/pokeneaController');

const router = Router();

router.get('/', pokeneaController.showRandomPokenea);

module.exports = router;
