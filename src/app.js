const path = require('path');
const express = require('express');
const routes = require('./routes');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(routes);

module.exports = app;
