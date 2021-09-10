/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
const app = require('./server');
require('newrelic');

app.listen(process.env.PORT, () => {
  console.log('App listening on port', process.env.PORT);
});

module.exports = app;
