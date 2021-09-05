/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
const db = require('../database/index');
const helpers = require('./reviewsHelpers');

const getReviews = (req, res) => {
  const { productId } = req.params;

  db.getReviews(productId)
    .then((result) => {
      const output = helpers.formatReviews(result, productId);
      res.send(output);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const markReviewHelpful = (req, res) => {
  const { reviewId } = req.params;

  db.markReviewHelpful(reviewId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const reportReview = (req, res) => {
  const { reviewId } = req.params;

  db.reportReview(reviewId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

const postNewReview = (req, res) => {
  const data = req.body;

  db.postNewReview(data)
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
};

module.exports = {
  getReviews,
  markReviewHelpful,
  reportReview,
  postNewReview,
};

/*
TODO:
-add tests (mocha/chai for unit/integration. istanbul for code coverage. K6 for load testing)
-implement 'sort by' feature (relevance, newness, helpfulness)
*/
