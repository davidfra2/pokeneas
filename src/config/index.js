const DEFAULT_PORT = 80;
const DEFAULT_IMAGES_BASE_URL = 'https://storage.googleapis.com/pokeneas-images';

function stripTrailingSlash(url) {
  return url.replace(/\/+$/, '');
}

module.exports = {
  port: Number(process.env.PORT) || DEFAULT_PORT,
  imagesBaseUrl: stripTrailingSlash(process.env.IMAGES_BASE_URL || DEFAULT_IMAGES_BASE_URL),
};
