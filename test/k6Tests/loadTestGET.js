/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { sleep, check } from 'k6';

export default () => {
  const getRandomIntInclusive = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const id = getRandomIntInclusive(1, 1000000);
  const res = http.get(`http://localhost:8080/reviews/product/${id}?sort=relevance`);

  sleep(1);

  const checkRes = check(res, {
    'status is 200 (there are reviews for this product id)': (r) => r.status === 200,
    'status is 400 (there are no reviews for this product id)': (r) => r.status === 400,
    'response body': (r) => r.body.length > 0 === true,
    'sends valid data even if db request fails': (r) => r.body.includes('productName'),
  });
};
