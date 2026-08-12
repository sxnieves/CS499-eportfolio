const express = require('express');
const path = require('path');
const hbs = require('hbs');

require('./app_api/models/db');

const indexRouter = require('./app_server/routes/index');
const apiRouter = require('./app_api/routes/index');

const app = express();

app.set('views', path.join(__dirname, 'app_server', 'views'));
app.set('view engine', 'hbs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:4200';

app.use('/api', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', allowedOrigin);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});


app.use('/', indexRouter);
app.use('/api', apiRouter);

const port = 3000;

app.listen(port, () => {
  console.log('Server running on port ' + port);
});