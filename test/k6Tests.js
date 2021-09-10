/* eslint-disable import/extensions */
/* eslint-disable import/no-duplicates */
/* eslint-disable func-names */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-unresolved */
import http from 'k6/http';
import { sleep, group, check } from 'k6';

const testGET = () => {
  const getRandomIntInclusive = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const id = getRandomIntInclusive(1, 1000000);
  const res = http.get(`http://localhost:8080/reviews/product/${id}?sort=relevance`);

  sleep(1);

  const checkRes = check(res, {
    'status is 200 (there are reviews for this product id)': (r) => r.status === 200,
    'sends valid data even if db request fails': (r) => r.body.includes('productName'),
  });
};

const testPOST = () => {
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
  });
};

const testREPORT = () => {
  const getRandomIntInclusive = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const id = getRandomIntInclusive(1, 1000000);
  const res = http.put(`http://localhost:8080/reviews/${id}/report`);

  sleep(1);

  const checkRes = check(res, {
    'status is 204 (review reported)': (r) => r.status === 204,
  });
};

const testHELPFUL = () => {
  const getRandomIntInclusive = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const id = getRandomIntInclusive(1, 1000000);
  const res = http.put(`http://localhost:8080/reviews/${id}/helpful`);

  sleep(1);

  const checkRes = check(res, {
    'status is 204 (review marked helpful)': (r) => r.status === 204,
  });
};

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 150,
      timeUnit: '1s',
      duration: '120s',
      preAllocatedVUs: 150,
      maxVUs: 225,
    },
  },
  thresholds: { http_req_duration: ['p(98)<18'] },
};

export default () => {
  group('GET request', () => {
    testGET();
  });

  group('POST request', () => {
    testPOST();
  });

  group('report PUT request', () => {
    testREPORT();
  });

  group('helpful PUT request', () => {
    testHELPFUL();
  });

  sleep(1);
};
