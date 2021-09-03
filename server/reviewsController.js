/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-console */
const { db } = require('../database/index');

const getReviews = (req, res) => {
  const { productId } = req.params;

  const query = `
  SELECT
    reviews.id AS reviews_id, reviews.rating, reviews.summary, reviews.recommend, reviews.response, reviews.body, to_timestamp(reviews.date / 1000) AS date, reviews.reviewer_name, reviews.helpfulness, reviews.reported, reviews_characteristics.value AS characteristics_value, reviews_characteristics.characteristic_id AS characteristics_id, characteristics.name AS characteristics_name, products.name AS product_name,
    CASE WHEN EXISTS (SELECT reviews_photos.url FROM reviews_photos WHERE reviews_photos.review_id = reviews.id)
      THEN (SELECT reviews_photos.url FROM reviews_photos WHERE reviews_photos.review_id = reviews.id)
      ELSE ''
    END AS photo_url,
    CASE WHEN EXISTS (SELECT reviews_photos.id FROM reviews_photos WHERE reviews_photos.review_id = reviews.id)
      THEN (SELECT id FROM reviews_photos WHERE reviews_photos.review_id = reviews.id)
      ELSE NULL
    END AS photo_id
  FROM reviews, reviews_characteristics, characteristics, products
  WHERE reviews.product_id = $1
  AND reviews_characteristics.review_id = reviews.id
  AND characteristics.id = reviews_characteristics.characteristic_id
  AND reviews.product_id = products.id
  GROUP BY reviews.id, reviews_characteristics.value, characteristics.name, products.name, reviews_characteristics.characteristic_id
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

      const extractPhotos = (reviews) => {
        const photos = [];
        const tracker = [];

        for (let i = 0; i < reviews.length; i++) {
          const item = reviews[i];

          const obj = {
            id: item.photo_id,
            url: item.photo_url,
          };

          if (!tracker.includes(item.photo_url) && item.photo_url) {
            photos.push(obj);
          }

          tracker.push(item.photo_url);
        }

        return photos;
      };

      const extractCharacteristics = (reviews) => {
        const chars = {};

        for (let i = 0; i < reviews.length; i++) {
          const item = reviews[i];

          if (!chars[item.characteristics_name]) {
            chars[item.characteristics_name] = [
              item.characteristics_id,
              item.characteristics_value,
            ];
          } else if (chars[item.characteristics_name]) {
            chars[item.characteristics_name].push(item.characteristics_value);
          }
        }

        const getAverage = (arr) => arr.reduce((acc, n) => acc + n) / arr.length;

        for (const key in chars) {
          const item = chars[key];
          const obj = { id: 0, value: '' };

          [obj.id] = item;

          obj.value = getAverage(item.slice(1)).toString();

          chars[key] = obj;
        }

        return chars;
      };

      const constructMeta = (reviews, tracker) => {
        const reviewsUniq = [];

        for (const key in tracker) {
          reviewsUniq.push(tracker[key][0]);
        }

        const meta = {
          product_id: productId.toString(),
          ratings: {},
          recommended: {
            true: 0,
            false: 0,
          },
          characteristics: extractCharacteristics(reviews),
        };

        for (let i = 0; i < reviewsUniq.length; i++) {
          const item = reviewsUniq[i];

          if (!meta.ratings[item.rating]) {
            meta.ratings[item.rating] = 1;
          } else if (meta.ratings[item.rating]) {
            meta.ratings[item.rating]++;
          }

          for (const key in meta.ratings) {
            meta.ratings[key] = meta.ratings[key].toString();
          }

          meta.recommended[item.recommend]++;
        }

        return meta;
      };

      output.meta = constructMeta(result, reviewsTracker);

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
            photos: extractPhotos(reviewsTracker[review]),
          };

          output.results.push(reviewObj);
        }
      }

      console.log(output);
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
  //must account for characteristics and photos tables...

  const productId = req.body.product_id || 1;

  console.log('entered post new review for product id: ', productId);

  let query = `
  INSERT INTO reviews()
  VALUES($1)
  ;`;

  let query2 = `
  SELECT *
  FROM reviews
  WHERE id=1
  ;`;

  let query3 = `
  SELECT *
  FROM reviews_characteristics
  WHERE id=1
  ;`;

  let query4 = `
  SELECT *
  FROM reviews_photos
  WHERE id=1
  ;`;

  db.any(query2, productId)
    .then((result) => {
      console.log('post result', result);
      // res.sendStatus(201);
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
-add post new review route
-add evergreen data for potential failing requests
-add tests (K6?)
-implement 'sort by' feature (relevance, newness, helpfulness)
*/
