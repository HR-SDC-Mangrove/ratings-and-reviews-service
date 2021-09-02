const { db } = require('../database/index');

const reviews = (req, res) => {
  let productId = req.params.productId;
  console.log('REQUESTED product id: ', productId);

  let query = 'SELECT * FROM reviews WHERE product_id=$1';
  let query2 = 'SELECT url FROM reviews_photos WHERE review_id=$1';
  let query3 = 'SELECT * FROM reviews_characteristics WHERE review_id=$1';
  let query4 = 'SELECT name FROM products WHERE id=$1';
  let query5 = 'SELECT name FROM characteristics WHERE product_id=$1';

  db.any(query, productId)
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  reviews,
};
