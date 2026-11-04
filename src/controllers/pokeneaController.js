const pokeneaService = require('../services/pokeneaService');
const { getContainerId } = require('../utils/container');
const { renderPokenea } = require('../views/pokeneaView');

function showRandomPokenea(req, res) {
  const pokenea = pokeneaService.getRandom();
  res.send(
    renderPokenea({
      nombre: pokenea.nombre,
      imagenUrl: pokeneaService.getImageUrl(pokenea),
      fraseFilosofica: pokenea.fraseFilosofica,
      containerId: getContainerId(),
    }),
  );
}

module.exports = { showRandomPokenea };
