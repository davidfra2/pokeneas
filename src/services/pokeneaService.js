const pokeneas = require('../data/pokeneas');
const { imagesBaseUrl } = require('../config');

function getRandom() {
  const index = Math.floor(Math.random() * pokeneas.length);
  return pokeneas[index];
}

function toPublicJson(pokenea) {
  const { id, nombre, altura, habilidad } = pokenea;
  return { id, nombre, altura, habilidad };
}

function getImageUrl(pokenea) {
  return `${imagesBaseUrl}/${pokenea.imagen}`;
}

module.exports = { getRandom, toPublicJson, getImageUrl };
