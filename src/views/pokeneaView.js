const fs = require('fs');
const path = require('path');

const plantilla = fs.readFileSync(path.join(__dirname, 'pokenea.html'), 'utf8');

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function renderPokenea(datos) {
  return plantilla.replace(/{{(\w+)}}/g, (_, clave) => escapar(datos[clave] ?? ''));
}

module.exports = { renderPokenea };