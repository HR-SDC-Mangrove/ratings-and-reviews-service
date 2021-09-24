/* eslint-disable no-console */
const express = require('express');

const app = express();

require('dotenv').config();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const reviewsRouter = require('./reviewsRoutes');

app.use('/reviews', reviewsRouter);

const loaderIO = (req, res) => {
  console.log('entered loader');

  res.sendFile(process.env.LOADER);
};

app.get('/loaderio-d37ce2bdeb6d2d663531cf1c51a39bd9.txt', loaderIO);

app.get('/loaderio-d37ce2bdeb6d2d663531cf1c51a39bd9.html', loaderIO);

app.get('/loaderio-d37ce2bdeb6d2d663531cf1c51a39bd9/', loaderIO);

module.exports = app;
