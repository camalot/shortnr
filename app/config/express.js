const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const UIAllow = require('../api/middleware/uiAllow');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(path.resolve(), 'public')));

app.get('/', UIAllow.verify, (req, res) => {
  return res.sendFile(path.join(path.resolve(), 'view/index.html'));
})

app.get('/', (req, res) => {
  return res.sendStatus(404);
});

// Mount all routes on / path
app.use('/', routes);

module.exports = app;
