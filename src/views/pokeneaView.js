const fs = require('fs');
const path = require('path');

const TEMPLATE = fs.readFileSync(path.join(__dirname, 'pokenea.html'), 'utf8');
const PLACEHOLDER_PATTERN = /{{(\w+)}}/g;
const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function renderPokenea(viewData) {
  return TEMPLATE.replace(PLACEHOLDER_PATTERN, (_, key) => escapeHtml(viewData[key] ?? ''));
}

module.exports = { renderPokenea };
