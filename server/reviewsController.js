/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const db = require('../database/index');
const helpers = require('./reviewsHelpers');

const getReviews = (req, res) => {
  const { productId } = req.params;

  const output = {
    product: productId,
    productName: '',
    meta: {},
    results: [],
  };

  db.getReviews(productId)
    .then((result) => {
      output.productName = result[0].product_name;

      const reviewsTracker = {};

      for (let i = 0; i < result.length; i++) {
        const item = result[i];

        if (!reviewsTracker[item.reviews_id]) {
          reviewsTracker[item.reviews_id] = [item];
        } else if (reviewsTracker[item.reviews_id]) {
          reviewsTracker[item.reviews_id].push(item);
        }
      }

      output.meta = helpers.constructMeta(result, reviewsTracker, productId);

      for (const review in reviewsTracker) {
        const item = reviewsTracker[review][0];

        if (!item.reported) {
          if (item.response === 'null') {
            item.response = null;
          }

          const reviewObj = {
            review_id: item.reviews_id,
            rating: item.rating,
            summary: item.summary,
            recommend: item.recommend,
            response: item.response,
            body: item.body,
            date: JSON.stringify(item.date).slice(1, -1),
            reviewer_name: item.reviewer_name,
            helpfulness: item.helpfulness,
            photos: helpers.extractPhotos(reviewsTracker[review]),
          };

          output.results.push(reviewObj);
        }
      }
      res.send(output);
    })
    .catch((err) => {
      console.log(err);
    });
};

const markReviewHelpful = (req, res) => {
  const { reviewId } = req.params;

  db.markReviewHelpful(reviewId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
};

const reportReview = (req, res) => {
  const { reviewId } = req.params;

  db.reportReview(reviewId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
};

const postNewReview = (req, res) => {
  const data = req.body;

  db.postNewReview(data)
    .then(() => {
      res.sendStatus(201);
    })
    .catch((err) => {
      console.log(err);
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
-allow user to configure db connection using env file (currently hardcoded)
-add evergreen data for potential failing requests
-add tests (K6?)
-implement 'sort by' feature (relevance, newness, helpfulness)
*/
