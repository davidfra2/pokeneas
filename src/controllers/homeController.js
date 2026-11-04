const path = require('path');

const HOME_VIEW_PATH = path.join(__dirname, '..', 'views', 'index.html');

function showHome(req, res) {
  res.sendFile(HOME_VIEW_PATH);
}

module.exports = { showHome };
