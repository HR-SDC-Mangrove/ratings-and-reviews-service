/* eslint-disable no-console */
const express = require('express');

const app = express();

require('dotenv').config();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const reviewsRouter = require('./reviewsRoutes');

app.use('/reviews', reviewsRouter);

// BELOW ROUTES ARE FOR TESTING ONLY
const sendFile = (fileName) => {
  const output = (req, res) => {
    res.sendFile(fileName);
  };

  return output;
};

const stressTest = (req, res) => {
  const productId = Math.floor(Math.random() * 1000000) + 1;

  res.redirect(`/reviews/product/${productId}`);
};

const stressTestPUT = (req, res) => {
  const productId = Math.floor(Math.random() * 1000000) + 1;

  res.redirect(`/reviews/product/${productId}/helpful`);
};

app.get(`/${process.env.LOADER_FILE}.txt`, sendFile(process.env.LOADER));
app.get(`/${process.env.LOADER_FILE}.html`, sendFile(process.env.LOADER));
app.get(`/${process.env.LOADER_FILE}/`, sendFile(process.env.LOADER));
app.get('/loaderPayload.json', sendFile(process.env.LOADER_PAYLOAD));
app.get('/stressTest', stressTest);
app.put('/stressTestPUT', stressTestPUT);

module.exports = app;
