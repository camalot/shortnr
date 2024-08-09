const path = require('path');
const fs = require("fs");
const envFile = path.join(__dirname, "./.env.test");

try {
  fs.accessSync(envFile, fs.F_OK);
  console.log(`loading .env file from ${envFile}`);
  require('dotenv').config({ path: envFile });
} catch (e) {
  console.log(e);
  console.log("no .env file found");
  // no env file
}

// const __dir = process.cwd();
// const __env = new URL(`file://${__dir}/test/.env.test`);

// require('dotenv').config({
//   path: __env,
// });

const hbs = require('hbs');
const LogsMongoClient = require('../api/mongo/Logs');
const config = require('../config');
const ui = require('../api/middleware/ui');

const express = require('express');
const bodyParser = require('body-parser');
const routes = require('../routes/index');

const app = express();
app.set('view engine', 'hbs');
app.set('views', path.join(path.resolve(), 'views'));
require('../api/hbs/xif');
require('../api/hbs/sections');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(path.resolve(), 'assets')));

app.get('/', ui.allow, (req, res) => {
  return res.render('index', { title: 'Shortnr', config });
})

// Mount all routes on / path
app.use('/', routes);

module.exports = app;