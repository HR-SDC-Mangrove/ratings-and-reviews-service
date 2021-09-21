const initOptions = {
  error(error, e) {
    if (e.cn) {
      console.log('PG CN ERROR: ', e.cn);
      console.log('PG EVENT ERROR: ', error.message || error);
    }
  },
  schema: process.env.DB_SCHEMA,
};
const pgp = require('pg-promise')(initOptions);

const helpers = require('./dbHelpers');

const cn = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const db = pgp(cn);

db.connect()
  .then((obj) => {
    console.log('DB CONNECTED', obj.client.serverVersion);
  })
  .catch((err) => {
    console.log('DB ERROR: ', err);
  });

const getReviews = (productId) => {
  console.log('ENTERED GET REVIEWS DB', db);

  const query = `
  SELECT DISTINCT
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

  return db.any(query, productId);
};

const markReviewHelpful = (reviewId) => {
  const query = `
  UPDATE reviews
  SET helpfulness = helpfulness + 1
  WHERE id=$1
  ;`;

  return db.any(query, reviewId);
};

const reportReview = (reviewId) => {
  const query = `
  UPDATE reviews
  SET reported = TRUE
  WHERE id=$1
  ;`;

  return db.any(query, reviewId);
};

const postNewReview = (data) => {
  const query = `
  WITH ins1 AS (
    INSERT INTO reviews(id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
    VALUES(DEFAULT, ${data.product_id}, ${data.rating}, ROUND(EXTRACT(EPOCH FROM NOW())::float*1000), '${data.summary}', '${data.body}', ${data.recommend}, FALSE, '${data.name}', '${data.email}', '', 0)
    RETURNING id
    )
  ${helpers.constructPhotoQueries(data.photos)}
  INSERT INTO reviews_characteristics(characteristic_id, review_id, value)
  ${helpers.constructCharacteristicQueries(data.characteristics)}
  RETURNING (SELECT id AS review_id FROM ins1)
  ;`;

  return db.any(query);
};

module.exports = {
  db,
  getReviews,
  markReviewHelpful,
  reportReview,
  postNewReview,
};
