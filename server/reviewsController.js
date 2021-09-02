const { db } = require('../database/index');

const reviews = (req, res) => {
  console.log('hi reviews controller');
  res.send('hi reviews controller');
};

module.exports = {
  reviews,
};
