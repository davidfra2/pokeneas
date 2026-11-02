const os = require('os');

function getContainerId() {
  return os.hostname();
}

module.exports = { getContainerId };
