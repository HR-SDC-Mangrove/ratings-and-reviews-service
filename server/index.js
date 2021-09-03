const express = require('express');

const app = express();

require('dotenv').config();

const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const reviewsRouter = require('./reviewsRoutes');

app.use('/reviews', reviewsRouter);

app.listen(process.env.PORT, () => {
  console.log('App listening on port', process.env.PORT);
});
