const fs = require('fs');
const fastcsv = require('fast-csv');
const { Pool, Client } = require('pg');


const stream = fs.createReadStream('../SDC-DATA/reviews.csv');
const csvData = [];



const csvStream = fastcsv
  .parse()
  .on('data', (data) => {
    csvData.push(data);
    console.log(data);
  })
  .on('end', () => {
    console.log('!!!!!!!!!!END!!!!!!!!!');
    csvData.shift();

    const pool = new Pool({
      host: 'localhost',
      user: 'sunikkim',
      database: 'reviews',
      password: 'password',
      port: 5432,
    });

    const makeTableQuery = `
    CREATE TABLE reviews(
      id INTEGER PRIMARY KEY,
      product_id INTEGER,
      rating INTEGER,
      date DATE,
      summary TEXT,
      body TEXT,
      recommend BOOLEAN,
      reported BOOLEAN,
      reviewer_name TEXT,
      reviewer_email TEXT,
      response TEXT,
      helpfulness INTEGER
    );
    `;

    pool.query(makeTableQuery, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('Table is successfully created!');
    });

    const query = 'INSERT INTO category (product_id, rating, date, summary, body, recommend, reported, reviewer_name, reviewer_email, response, helpfulness) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)';

    pool.connect((err, client, done) => {
      if (err) {
        throw err;
      }

      try {
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


// CREATE TABLE reviews(
//   id INTEGER PRIMARY KEY,
//   product_id INTEGER // REFERENCES products,
//   rating INTEGER,
//   date DATE,
//   summary TEXT,
//   body TEXT,
//   recommend BOOLEAN,
//   reported BOOLEAN,
//   reviewer_name TEXT,
//   reviewer_email TEXT,
//   response TEXT,
//   helpfulness INTEGER
// );
