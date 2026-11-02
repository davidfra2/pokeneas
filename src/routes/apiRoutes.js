const { Router } = require('express');
const apiController = require('../controllers/apiController');

const router = Router();

router.get('/pokenea', apiController.getRandomPokenea);

module.exports = router;
