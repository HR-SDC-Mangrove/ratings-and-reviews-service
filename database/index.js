const initOptions = {
  schema: 'reviews',
};
const pgp = require('pg-promise')(initOptions);

const helpers = require('./dbHelpers');

const cn = `postgres://sunikkim:${process.env.DB_PASSWORD}@localhost:5432/reviews`;
const db = pgp(cn);

const getReviews = (productId) => {
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

  return db.any(query, productId)
    .then((result) => result)
    .catch((err) => err);
};

const markReviewHelpful = (reviewId) => {
  const query = `
  UPDATE reviews
  SET helpfulness = helpfulness + 1
  WHERE id=$1
  ;`;

  return db.any(query, reviewId)
    .then((result) => result)
    .catch((err) => err);
};

const reportReview = (reviewId) => {
  const query = `
  UPDATE reviews
  SET reported = TRUE
  WHERE id=$1
  ;`;

  return db.any(query, reviewId)
    .then((result) => result)
    .catch((err) => err);
};

const postNewReview = (data) => {
  const query = `
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

  return db.any(query)
    .then((result) => result)
    .catch((err) => err);
};

module.exports = {
  getReviews,
  markReviewHelpful,
  reportReview,
  postNewReview,
};
