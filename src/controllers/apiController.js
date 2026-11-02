const pokeneaService = require('../services/pokeneaService');
const { getContainerId } = require('../utils/container');

function getRandomPokenea(req, res) {
  const pokenea = pokeneaService.getRandom();
  res.json({
    ...pokeneaService.toPublicJson(pokenea),
    containerId: getContainerId(),
  });
}

module.exports = { getRandomPokenea };
