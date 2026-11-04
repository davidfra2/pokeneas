const { Router } = require('express');
const homeController = require('../controllers/homeController');
const apiRoutes = require('./apiRoutes');
const pokeneaRoutes = require('./pokeneaRoutes');

const router = Router();

router.get('/', homeController.showHome);
router.use('/api', apiRoutes);
router.use('/pokenea', pokeneaRoutes);

module.exports = router;
