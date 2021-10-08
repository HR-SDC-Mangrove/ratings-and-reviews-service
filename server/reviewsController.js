/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
const redis = require('redis');
const db = require('../database/index');
const helpers = require('./reviewsHelpers');
const { evergreenData } = require('../test/mockData');

const client = redis.createClient();
client.on('connect', () => {
  console.log('redis connected');
});
client.on('error', (err) => {
  console.log('redis error: ', err);
});

const getReviews = (req, res) => {
  const { productId } = req.params;
  const sortMethod = req.query.sort;
  const count = Number(req.query.count);

  console.log('entered get reviews', productId);

  if (process.env.REDIS) {
    console.log('entered redis');
    client.get(productId, (err, reply) => {
      if (reply) {
        const result = JSON.parse(reply);
        res.send(result);
      } else {
        db.getReviews(productId)
          .then((data) => {
            console.log('dataONE', data);
            if (data.length) {
              const output = helpers.formatReviews(data, productId, sortMethod, count);
              client.set(productId, JSON.stringify(output));
              res.send(output);
            } else {
              client.set(productId, JSON.stringify(evergreenData));
              res.send(evergreenData);
            }
          });
      }
    });
  } else {
    db.getReviews(productId)
      .then((data) => {
        console.log('dataTWO', data);
        if (data.length) {
          const output = helpers.formatReviews(data, productId, sortMethod, count);
          res.send(output);
        } else {
          res.send(evergreenData);
        }
      });
  }
};

const markReviewHelpful = (req, res) => {
  const { reviewId } = req.params;

  console.log('markReviewHelpful reviewId', reviewId);

  db.markReviewHelpful(reviewId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(() => {
      res.status(400).send('An unexpected error occurred: could not mark this review helpful');
    });
};

const reportReview = (req, res) => {
  const { reviewId } = req.params;

  console.log('entered report review', reviewId);

  db.reportReview(reviewId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(() => {
      res.status(400).send('An unexpected error occurred: could not report this review');
    });
};

const postNewReview = (req, res) => {
  const data = req.body;

  console.log('entered post review', data);

  db.postNewReview(data)
    .then(() => {
      res.sendStatus(201);
    })
    .catch(() => {
      res.status(400).send('An unexpected error occurred: could not post this review');
    });
};

// BELOW ROUTES ARE FOR TESTING ONLY
const getReviewsTEST = (req, res) => {
  const productId = Math.floor(Math.random() * 1000000) + 1;
  const sortMethod = req.query.sort;
  const count = Number(req.query.count);

  if (process.env.REDIS) {
    client.get(productId, (err, reply) => {
      if (reply) {
        const result = JSON.parse(reply);
        res.send(result);
      } else {
        db.getReviews(productId)
          .then((data) => {
            if (data.length) {
              const output = helpers.formatReviews(data, productId, sortMethod, count);
              client.set(productId, JSON.stringify(output));
              res.send(output);
            } else {
              client.set(productId, JSON.stringify(evergreenData));
              res.send(evergreenData);
            }
          });
      }
    });
  } else {
    db.getReviews(productId)
      .then((data) => {
        if (data.length) {
          const output = helpers.formatReviews(data, productId, sortMethod, count);
          res.send(output);
        } else {
          res.send(evergreenData);
        }
      });
  }
};

const markReviewHelpfulTEST = (req, res) => {
  const reviewId = Math.floor(Math.random() * 500000) + 1;

  db.markReviewHelpful(reviewId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(() => {
      res.status(400).send('An unexpected error occurred: could not mark this review helpful');
    });
};

module.exports = {
  getReviews,
  markReviewHelpful,
  reportReview,
  postNewReview,
  getReviewsTEST,
  markReviewHelpfulTEST,
};
