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
  res.sendFile(process.env.LOADER);
};

app.get(`/${process.env.LOADER_FILE}.txt`, loaderIO);

app.get(`/${process.env.LOADER_FILE}.html`, loaderIO);

app.get(`/${process.env.LOADER_FILE}/`, loaderIO);

const loaderPayload = (req, res) => {
  res.sendFile(process.env.LOADER_PAYLOAD);
};

app.get('/loaderPayload.json', loaderPayload);

module.exports = app;
