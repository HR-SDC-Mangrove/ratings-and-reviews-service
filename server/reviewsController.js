const { db } = require('../database/index');

const reviews = (req, res) => {
  let productId = req.params.productId;
  console.log('REQUESTED product id: ', productId);

  let query = 'SELECT id, rating, summary, recommend, response, body, to_timestamp(date / 1000), reviewer_name, helpfulness FROM reviews WHERE product_id=$1';
  let query2 = 'SELECT * FROM reviews_photos WHERE review_id=$1';
  let query3 = 'SELECT * FROM reviews_characteristics WHERE review_id=$1';
  let query4 = 'SELECT name FROM products WHERE id=$1';
  let query5 = 'SELECT name FROM characteristics WHERE id=$1';

  let output = {
    product: productId,
    results: [],
  };

  db.any(query, productId)
    .then((result) => {
      // add evergreen/default data for failed requests/faulty data
      // console.log(result);

      for (let i = 0; i < result.length; i++) {
        let item = result[i];

        if (item.response === 'null') {
          item.response = null;
        }

        let reviewObj = {
          review_id: item.id,
          rating: item.rating,
          summary: item.summary,
          recommend: item.recommend,
          response: item.response,
          body: item.body,
          date: JSON.stringify(item.to_timestamp).slice(1, -1),
          reviewer_name: item.reviewer_name,
          helpfulness: item.helpfulness,
          photos: [],
        };

        output.results.push(reviewObj);
      }

      console.log('output', output);
      res.send(output);
    })
    .catch(err => {
      console.log(err);
    });
};

const reviewsMeta = (req, res) => {
  let productId = req.params.productId;
  console.log('REQUESTED product id: ', productId);

  let query = 'SELECT * FROM reviews WHERE product_id=$1';
  let query2 = 'SELECT * FROM reviews_photos WHERE review_id=$1';
  let query3 = 'SELECT * FROM reviews_characteristics, characteristics WHERE reviews_characteristics.review_id=$1 AND reviews_characteristics.characteristic_id = characteristics.id';
  let query4 = 'SELECT name FROM products WHERE id=$1';
  let query5 = 'SELECT name FROM characteristics WHERE id=$1';

  db.any(query, productId)
    .then((result) => {
      // add evergreen/default data for failed requests/faulty data
      console.log('META', result);

      let output = {
        product_id: productId.toString(),
        ratings: {},
        recommended: {
          true: 0,
          false: 0,
        },
        characteristics: {},
      };

      for (let i = 0; i < result.length; i++) {
        let item = result[i];

        if (!output.ratings[item.rating]) {
          output.ratings[item.rating] = 1;
        } else if (output.ratings[item.rating]) {
          output.ratings[item.rating]++;
        }

        for (let key in output.ratings) {
          output.ratings[key] = output.ratings[key].toString();
        }

        output.recommended[item.recommended]++;

        let reviewId = item.id;

        db.any(query3, reviewId)
          .then((data) => {
            console.log('CHARACTERISTICS', data);

            for (let i = 0; i < data.length; i++) {
              output.characteristics[data[i].name] = {
                id: data[i].id,
                value: data[i].value.toString(),
              };

              //GET AVERAGES OF VALUES
              // if (!valueTracker[data[i].id]) {
              //   valueTracker[data[i].id] = data[i].value;
              // } else if (valueTracker[data[i].id]) {
              //   valueTracker[data[i].id].push(data[i].value);
              // }
            }
            console.log(output);
            res.send(output);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    })
    .catch(err => {
      console.log(err);
    });
};

// ADD PRODUCT NAME ROUTE

/*
TODO:
add routes:
-product name
-report review
-mark review helpful
-post new review

-calculate averages of characteristic values
-add photos to data (new query, etc)
-add evergreen data for potential failing requests

-consolidate all requests into one request, one data blob for entire widget
-try consolidating queries using joins
-consider alternative data structures
*/

module.exports = {
  reviews,
  reviewsMeta,
};
