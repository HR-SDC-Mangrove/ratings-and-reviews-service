DROP SCHEMA IF EXISTS reviews CASCADE;

CREATE SCHEMA reviews
  CREATE TABLE reviews(
    id INTEGER NOT NULL PRIMARY KEY,
    product_id INTEGER,
    rating INTEGER,
    date BIGINT,
    summary TEXT,
    body TEXT,
    recommend BOOLEAN,
    reported BOOLEAN,
    reviewer_name TEXT,
    reviewer_email TEXT,
    response TEXT,
    helpfulness INTEGER
  )

  CREATE INDEX ON reviews(product_id)

  CREATE TABLE reviews_photos(
    id INTEGER NOT NULL PRIMARY KEY,
    review_id INTEGER,
    url TEXT
  )

  CREATE INDEX ON reviews_photos(review_id)

  CREATE TABLE reviews_characteristics(
    id INTEGER NOT NULL PRIMARY KEY,
    characteristic_id INTEGER,
    review_id INTEGER,
    value INTEGER
  )

  CREATE INDEX ON reviews_characteristics(review_id)

  CREATE TABLE characteristics(
    id INTEGER NOT NULL PRIMARY KEY,
    product_id INTEGER,
    name TEXT
  )

  CREATE INDEX ON characteristics(id)

  CREATE TABLE products(
    id INTEGER NOT NULL PRIMARY KEY,
    name TEXT,
    slogan TEXT,
    description TEXT,
    category TEXT,
    default_price INTEGER
  )

  CREATE INDEX ON products(id);

SET search_path TO reviews;

\copy reviews(id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/reviews.csv' delimiter ',' csv header;

\copy products(id, name, slogan, description, category, default_price) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/product.csv' delimiter ',' csv header;

\copy characteristics(id, product_id, name) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/characteristics.csv' delimiter ',' csv header;

\copy reviews_characteristics(id, characteristic_id, review_id, value) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/characteristic_reviews.csv' delimiter ',' csv header;

\copy reviews_photos(id, review_id, url) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/reviews_photos.csv' delimiter ',' csv header;

EXPLAIN ANALYZE SELECT * from REVIEWS WHERE product_id=1;
EXPLAIN ANALYZE SELECT * from REVIEWS WHERE product_id=10000;
EXPLAIN ANALYZE SELECT * from REVIEWS WHERE product_id=1000000;

EXPLAIN ANALYZE SELECT * from REVIEWS_PHOTOS WHERE review_id=1;
EXPLAIN ANALYZE SELECT * from REVIEWS_PHOTOS WHERE review_id=10000;
EXPLAIN ANALYZE SELECT * from REVIEWS_PHOTOS WHERE review_id=1000000;

EXPLAIN ANALYZE SELECT * from REVIEWS_CHARACTERISTICS WHERE review_id=1;
EXPLAIN ANALYZE SELECT * from REVIEWS_CHARACTERISTICS WHERE review_id=10000;
EXPLAIN ANALYZE SELECT * from REVIEWS_CHARACTERISTICS WHERE review_id=1000000;

EXPLAIN ANALYZE SELECT * from CHARACTERISTICS WHERE id=1;
EXPLAIN ANALYZE SELECT * from CHARACTERISTICS WHERE id=10000;
EXPLAIN ANALYZE SELECT * from CHARACTERISTICS WHERE id=1000000;

EXPLAIN ANALYZE SELECT * from PRODUCTS WHERE id=1;
EXPLAIN ANALYZE SELECT * from PRODUCTS WHERE id=10000;
EXPLAIN ANALYZE SELECT * from PRODUCTS WHERE id=1000000;

EXPLAIN ANALYZE SELECT
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
  WHERE reviews.product_id = 47421
  AND reviews_characteristics.review_id = reviews.id
  AND characteristics.id = reviews_characteristics.characteristic_id
  AND reviews.product_id = products.id
  GROUP BY reviews.id, reviews_characteristics.value, characteristics.name, products.name, reviews_characteristics.characteristic_id;

EXPLAIN ANALYZE SELECT
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
  WHERE reviews.product_id = 1
  AND reviews_characteristics.review_id = reviews.id
  AND characteristics.id = reviews_characteristics.characteristic_id
  AND reviews.product_id = products.id
  GROUP BY reviews.id, reviews_characteristics.value, characteristics.name, products.name, reviews_characteristics.characteristic_id;

EXPLAIN ANALYZE SELECT
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
  WHERE reviews.product_id = 100000
  AND reviews_characteristics.review_id = reviews.id
  AND characteristics.id = reviews_characteristics.characteristic_id
  AND reviews.product_id = products.id
  GROUP BY reviews.id, reviews_characteristics.value, characteristics.name, products.name, reviews_characteristics.characteristic_id;