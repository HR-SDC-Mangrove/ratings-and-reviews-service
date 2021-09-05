const initOptions = {
  schema: 'reviews',
};

const pgp = require('pg-promise')(initOptions);

const cn = `postgres://sunikkim:${process.env.DB_PASSWORD}@localhost:5432/reviews`;
const db = pgp(cn);

module.exports = {
  db,
};
