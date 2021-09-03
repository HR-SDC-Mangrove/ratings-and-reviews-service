const { db } = require('../database/index');

const reviews = (req, res) => {
  const productId = req.params.productId;

  const query = `
  SELECT
    reviews.id AS reviews_id, reviews.rating, reviews.summary, reviews.recommend, reviews.response, reviews.body, to_timestamp(reviews.date / 1000) AS date, reviews.reviewer_name, reviews.helpfulness, reviews_characteristics.value AS characteristics_value, reviews_characteristics.characteristic_id AS characteristics_id, characteristics.name AS characteristics_name, products.name AS product_name,
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

        const getAverage = (arr) => {
          return arr.reduce((acc, n) => acc + n) / arr.length;
        };

        for (let key in chars) {
          let item = chars[key];

          let obj = { id: 0, value: '' };

          obj.id = item[0];
          obj.value = getAverage(item.slice(1)).toString();

          chars[key] = obj;
        }

        return chars;
      };

      const constructMeta = (reviews, tracker) => {
        const reviewsUniq = [];

        for (let key in tracker) {
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

          for (let key in meta.ratings) {
            meta.ratings[key] = meta.ratings[key].toString();
          }

          meta.recommended[item.recommend]++;
        }

        return meta;
      };

      output.meta = constructMeta(result, reviewsTracker);

      for (let review in reviewsTracker) {
        const item = reviewsTracker[review][0];

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

      console.log(output);
      res.send(output);
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  reviews,
};

/*
TODO:
add routes:
-report review
-mark review helpful
-post new review

-add evergreen data for potential failing requests

-implement 'sort by' feature (relevance, newness, helpfulness)
*/
