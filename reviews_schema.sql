DROP SCHEMA IF EXISTS reviews CASCADE;

CREATE SCHEMA reviews
  CREATE TABLE products(
    id SERIAL PRIMARY KEY,
    name TEXT,
    slogan TEXT,
    description TEXT,
    category TEXT,
    default_price INTEGER
  )

  CREATE TABLE reviews(
    id SERIAL PRIMARY KEY,
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

  CREATE TABLE reviews_photos(
    id SERIAL PRIMARY KEY,
    review_id INTEGER,
    url TEXT
  )

  CREATE TABLE characteristics(
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    name TEXT
  )

  CREATE TABLE reviews_characteristics(
    id SERIAL PRIMARY KEY,
    characteristic_id INTEGER,
    review_id INTEGER,
    value INTEGER
  );

SET search_path TO reviews;

\copy products(id, name, slogan, description, category, default_price) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/product.csv' delimiter ',' csv header

\copy reviews(id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/reviews.csv' delimiter ',' csv header

\copy reviews_photos(id, review_id, url) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/reviews_photos.csv' delimiter ',' csv header

\copy characteristics(id, product_id, name) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/characteristics.csv' delimiter ',' csv header

\copy reviews_characteristics(id, characteristic_id, review_id, value) from '/Users/sunikkim/Desktop/coding/HR-IMMERSIVE/SDC-DATA/characteristic_reviews.csv' delimiter ',' csv header;

CREATE INDEX ON products(id);
CREATE INDEX ON reviews(product_id);
CREATE INDEX ON reviews_photos(review_id);
CREATE INDEX ON characteristics(id);
CREATE INDEX ON reviews_characteristics(review_id);

ALTER TABLE reviews
  ADD CONSTRAINT fk_reviews FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE reviews_photos
  ADD CONSTRAINT fk_reviews_photos FOREIGN KEY (review_id) REFERENCES reviews(id);

ALTER TABLE characteristics
  ADD CONSTRAINT fk_characteristics FOREIGN KEY (product_id) REFERENCES products(id);

ALTER TABLE reviews_characteristics
  ADD CONSTRAINT fk_reviews_characteristics_c FOREIGN KEY (characteristic_id) REFERENCES characteristics(id);

ALTER TABLE reviews_characteristics
  ADD CONSTRAINT fk_reviews_characteristics_r FOREIGN KEY (review_id) REFERENCES reviews(id);

SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));
SELECT setval('reviews_photos_id_seq', (SELECT MAX(id) FROM reviews_photos));
SELECT setval('reviews_characteristics_id_seq', (SELECT MAX(id) FROM reviews_characteristics));
SELECT setval('characteristics_id_seq', (SELECT MAX(id) FROM characteristics));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

EXPLAIN ANALYZE SELECT * FROM reviews WHERE product_id=1;
EXPLAIN ANALYZE SELECT * FROM reviews WHERE product_id=10000;
EXPLAIN ANALYZE SELECT * FROM reviews WHERE product_id=1000000;

EXPLAIN ANALYZE SELECT * FROM reviews_photos WHERE review_id=1;
EXPLAIN ANALYZE SELECT * FROM reviews_photos WHERE review_id=10000;
EXPLAIN ANALYZE SELECT * FROM reviews_photos WHERE review_id=1000000;

EXPLAIN ANALYZE SELECT * FROM reviews_characteristics WHERE review_id=1;
EXPLAIN ANALYZE SELECT * FROM reviews_characteristics WHERE review_id=10000;
EXPLAIN ANALYZE SELECT * FROM reviews_characteristics WHERE review_id=1000000;

EXPLAIN ANALYZE SELECT * FROM characteristics WHERE id=1;
EXPLAIN ANALYZE SELECT * FROM characteristics WHERE id=10000;
EXPLAIN ANALYZE SELECT * FROM characteristics WHERE id=1000000;

EXPLAIN ANALYZE SELECT * FROM products WHERE id=1;
EXPLAIN ANALYZE SELECT * FROM products WHERE id=10000;
EXPLAIN ANALYZE SELECT * FROM products WHERE id=1000000;

EXPLAIN ANALYZE SELECT
    reviews.id AS reviews_id, reviews.rating, reviews.summary, reviews.recommend, reviews.response, reviews.body, to_timestamp(reviews.date / 1000) AS date, reviews.reviewer_name, reviews.helpfulness, reviews.reported, reviews_characteristics.value AS characteristics_value, reviews_characteristics.characteristic_id AS characteristics_id, characteristics.name AS characteristics_name, products.name AS product_name, reviews_photos.url AS photo_url, reviews_photos.id AS photo_id
  FROM
    reviews
      LEFT JOIN reviews_photos
        ON reviews_photos.review_id = reviews.id,
    reviews_characteristics, characteristics, products
  WHERE reviews.product_id = 47421
  AND reviews_characteristics.review_id = reviews.id
  AND characteristics.id = reviews_characteristics.characteristic_id
  AND reviews.product_id = products.id;

EXPLAIN ANALYZE SELECT
    reviews.id AS reviews_id, reviews.rating, reviews.summary, reviews.recommend, reviews.response, reviews.body, to_timestamp(reviews.date / 1000) AS date, reviews.reviewer_name, reviews.helpfulness, reviews.reported, reviews_characteristics.value AS characteristics_value, reviews_characteristics.characteristic_id AS characteristics_id, characteristics.name AS characteristics_name, products.name AS product_name, reviews_photos.url AS photo_url, reviews_photos.id AS photo_id
  FROM
    reviews
      LEFT JOIN reviews_photos
        ON reviews_photos.review_id = reviews.id,
    reviews_characteristics, characteristics, products
  WHERE reviews.product_id = 1
  AND reviews_characteristics.review_id = reviews.id
  AND characteristics.id = reviews_characteristics.characteristic_id
  AND reviews.product_id = products.id;

EXPLAIN ANALYZE SELECT
    reviews.id AS reviews_id, reviews.rating, reviews.summary, reviews.recommend, reviews.response, reviews.body, to_timestamp(reviews.date / 1000) AS date, reviews.reviewer_name, reviews.helpfulness, reviews.reported, reviews_characteristics.value AS characteristics_value, reviews_characteristics.characteristic_id AS characteristics_id, characteristics.name AS characteristics_name, products.name AS product_name, reviews_photos.url AS photo_url, reviews_photos.id AS photo_id
  FROM
    reviews
      LEFT JOIN reviews_photos
        ON reviews_photos.review_id = reviews.id,
    reviews_characteristics, characteristics, products
  WHERE reviews.product_id = 1000000
  AND reviews_characteristics.review_id = reviews.id
  AND characteristics.id = reviews_characteristics.characteristic_id
  AND reviews.product_id = products.id;

EXPLAIN ANALYZE UPDATE reviews
  SET helpfulness = helpfulness + 1
  WHERE id=1;

EXPLAIN ANALYZE UPDATE reviews
  SET reported = TRUE
  WHERE id=1;