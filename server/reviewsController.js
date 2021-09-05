/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const { db } = require('../database/index');
const helpers = require('./reviewsHelpers');

const getReviews = (req, res) => {
  const { productId } = req.params;

  const query = `
  SELECT
    reviews.id AS reviews_id, reviews.rating, reviews.summary, reviews.recommend, reviews.response, reviews.body, to_timestamp(reviews.date / 1000) AS date, reviews.reviewer_name, reviews.helpfulness, reviews.reported, reviews_characteristics.value AS characteristics_value, reviews_characteristics.characteristic_id AS characteristics_id, characteristics.name AS characteristics_name, products.name AS product_name, reviews_photos.url AS photo_url, reviews_photos.id AS photo_id
  FROM
    reviews
      LEFT JOIN reviews_photos
        ON reviews_photos.review_id = reviews.id,
    reviews_characteristics, characteristics, products
  WHERE reviews.product_id = $1
  AND reviews_characteristics.review_id = reviews.id
  AND characteristics.id = reviews_characteristics.characteristic_id
  AND reviews.product_id = products.id
  ;`;

  const output = {
    product: productId,
    productName: '',
    meta: {},
    results: [],
  };

  db.any(query, productId)
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

  const query = `
  UPDATE reviews
  SET helpfulness = helpfulness + 1
  WHERE id=$1
  ;`;

  db.any(query, reviewId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
};

const reportReview = (req, res) => {
  const { reviewId } = req.params;

  const query = `
  UPDATE reviews
  SET reported = TRUE
  WHERE id=$1
  ;`;

  db.any(query, reviewId)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      console.log(err);
    });
};

const postNewReview = (req, res) => {
  const data = req.body;

  const reviewQuery = `
  WITH ins1 AS (
    INSERT INTO reviews(id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
    VALUES((SELECT max(id) FROM reviews) + 1, ${data.product_id}, ${data.rating}, ROUND(EXTRACT(EPOCH FROM NOW())::float*1000), '${data.summary}', '${data.body}', ${data.recommend}, FALSE, '${data.name}', '${data.email}', '', 0)
    RETURNING id
    )
  ,ins2 AS (
    INSERT INTO reviews_photos(id, review_id, url)
    ${helpers.constructPhotoQueries(data.photos)}
    )
  INSERT INTO reviews_characteristics(id, characteristic_id, review_id, value)
  ${helpers.constructCharacteristicQueries(data.characteristics)}
  RETURNING (SELECT id AS review_id FROM ins1)
  ;`;

  db.any(reviewQuery)
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
-break db queries out into db file, export them as functions
-allow user to configure db connection using env file (currently hardcoded)
-add evergreen data for potential failing requests
-add tests (K6?)
-implement 'sort by' feature (relevance, newness, helpfulness)
*/
