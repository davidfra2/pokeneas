const app = require('./app');
const { port } = require('./config');

app.listen(port, () => {
  console.log(`Pokeneas escuchando en el puerto ${port}`);
});
