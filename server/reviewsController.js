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

  db.postNewReview(data)
    .then(() => {
      res.sendStatus(201);
    })
    .catch(() => {
      res.status(400).send('An unexpected error occurred: could not post this review');
    });
};

module.exports = {
  getReviews,
  markReviewHelpful,
  reportReview,
  postNewReview,
};
