/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { sleep, check } from 'k6';

export default () => {
  const getRandomIntInclusive = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const id = getRandomIntInclusive(1, 1000000);
  const res = http.put(`http://localhost:8080/reviews/${id}/report`);

  sleep(1);

  const checkRes = check(res, {
    'status is 204 (review reported)': (r) => r.status === 204,
    'status is 400 (could not report review)': (r) => r.status === 400,
  });
};
