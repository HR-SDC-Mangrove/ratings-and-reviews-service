/*
const fs = require('fs');
const fastcsv = require('fast-csv');
const { Pool, Client } = require('pg');



const client = new Client({
  host: 'localhost',
  user: 'sunikkim',
  database: 'reviews',
  password: 'password',
  port: 5432,
});

client.connect();

const tableQuery = `

`;

client.query(tableQuery, (err, res) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('Table is successfully dropped + created!');
});

DROP TABLE IF EXISTS reviews;

CREATE TABLE reviews(
  id INTEGER PRIMARY KEY,
  product_id INTEGER,
  rating INTEGER,
  date TIMESTAMP,
  summary TEXT,
  body TEXT,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name TEXT,
  reviewer_email TEXT,
  response TEXT,
  helpfulness INTEGER
);

DROP TABLE IF EXISTS staging;

CREATE TABLE staging(
  id INTEGER,
  product_id INTEGER,
  rating INTEGER,
  date TEXT,
  summary TEXT,
  body TEXT,
  recommend BOOLEAN,
  reported BOOLEAN,
  reviewer_name TEXT,
  reviewer_email TEXT,
  response TEXT,
  helpfulness INTEGER,
  converted TIMESTAMP
);

const stream = fs.createReadStream('../SDC-DATA/reviews_SMALLTEST.csv');
const csvData = [];
const csvStream = fastcsv
  .parse()
  .on('data', (data) => {
    csvData.push(data);
    // console.log(data);
  })
  .on('end', () => {
    csvData.shift();

    const pool = new Pool({
      host: 'localhost',
      user: 'sunikkim',
      database: 'reviews',
      password: 'password',
      port: 5432,
    });

    const query = `
    INSERT INTO public."staging" (id, product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
    `;

    pool.connect((err, client, done) => {
      if (err) {
        throw err;
      }

      try {
        client.query('UPDATE staging SET converted = date::date', (err, res) => {
          if (err) {
            console.log(err.stack);
          } else {
            console.log('CONVERTED DATE');
          }
        });

        csvData.forEach((row) => {
          client.query(query, row, (err, res) => {
            if (err) {
              console.log(err.stack);
            } else {
              console.log('inserted ' + res.rowCount + ' row:', row);
            }
          });
        });
      } finally {
        done();
      }
    });
  });

stream.pipe(csvStream);

*/