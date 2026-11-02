const { Router } = require('express');
const apiRoutes = require('./apiRoutes');

const router = Router();

router.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
  <head><meta charset="utf-8"><title>Pokeneas</title></head>
  <body>
    <h1>Pokeneas</h1>
    <ul>
      <li><a href="/api/pokenea">/api/pokenea</a> (JSON)</li>
      <li><a href="/pokenea">/pokenea</a> (vista)</li>
    </ul>
  </body>
</html>`);
});

router.use('/api', apiRoutes);

// TODO: montar aquí la ruta de la vista /pokenea, por ejemplo:
// router.use('/pokenea', require('./viewRoutes'));

module.exports = router;
