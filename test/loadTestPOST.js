/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { sleep, check } from 'k6';

export default () => {
  const getRandomIntInclusive = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const id = getRandomIntInclusive(1, 1000000);

  const data = {
    product_id: id,
    rating: 5,
    summary: 'k6test',
    body: 'k6testtesttesttest',
    recommend: true,
    name: 'k6',
    email: 'k6@k6.com',
    characteristics: {
      158622: 1,
      158623: 1,
      158624: 1,
      158625: 1,
    },
    photos: [
      'testImg1.jpg',
      'testImg2.jpg',
      'testImg3.jpg',
      'testImg4.jpg',
    ],
  };

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:8080/reviews/', JSON.stringify(data), params);

  sleep(1);

  const checkRes = check(res, {
    'status is 201 (review posted successfully)': (r) => r.status === 201,
    'status is 400 (could not post, review id already exists)': (r) => r.status === 400,
  });
};
