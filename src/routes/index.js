const path = require('path');
const { Router } = require('express');
const apiRoutes = require('./apiRoutes');

const router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

router.use('/api', apiRoutes);
router.use('/pokenea', require('./pokeneaRoutes'));

module.exports = router;
