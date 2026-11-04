const pokeneaService = require('../services/pokeneaService');
const { getContainerId } = require('../utils/container');
const { renderPokenea } = require('../views/pokeneaView');

function mostrarPokenea(req, res) {
  const p = pokeneaService.getRandom();
  res.send(renderPokenea({
    nombre: p.nombre,
    imagenUrl: pokeneaService.getImageUrl(p),
    fraseFilosofica: p.fraseFilosofica,
    containerId: getContainerId(),
  }));
}

module.exports = { mostrarPokenea };