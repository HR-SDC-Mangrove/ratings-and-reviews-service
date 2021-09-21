/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
const db = require('../database/index');
const helpers = require('./reviewsHelpers');
const { evergreenData } = require('../test/mockData');

const getReviews = async (req, res) => {
  const { productId } = req.params;
  const sortMethod = req.query.sort;
  const count = Number(req.query.count);

  const result = await db.getReviews(productId);

  console.log('ENTERED GET REVIEWS! result: ', result);

  if (result.length) {
    console.log('SUCCESS!!!');
    const output = helpers.formatReviews(result, productId, sortMethod, count);
    res.send(output);
  } else {
    console.log('FAILURE - SENDING EVERGREEN DATA');
    res.send(evergreenData);
  }
};

const markReviewHelpful = (req, res) => {
  const { reviewId } = req.params;

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
