/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest')('http://localhost:8080/reviews');
// eslint-disable-next-line no-unused-vars
// const app = require('../server/index');
const sampleData = require('./mockData');

const db = require('../database/index');
const dbHelpers = require('../database/dbHelpers');
const reviewsHelpers = require('../server/reviewsHelpers');

describe('GET /reviews', () => {
  it('returns correct reviews in correct format for valid product id', async () => {
    const response = await request.get('/product/47421');
    expect(response.body.product).to.eql('47421');
    expect(response.body.results.length).to.not.eql(0);
  });
});

describe('mark review helpful', () => {
  it('successfully marks review helpful', async () => {
    const response = await request.put('/27027/helpful');
    expect(response.statusCode).to.eql(204);
  });
});

describe('report review', () => {
  it('successfully reports review', async () => {
    const response = await request.put('/27027/report');
    expect(response.statusCode).to.eql(204);
  });
});

describe('POST new review', () => {
  it('successfully posts new review', async () => {
    const response = await request.post('/').send({
      product_id: 50000,
      rating: 5,
      summary: 'MOCHACHAITEST',
      body: 'MOCHACHAITESTING',
      recommend: true,
      name: 'test',
      email: 'test@test.com',
      characteristics: {
        158622: 1, 158623: 1, 158624: 1, 158625: 1,
      },
      photos: ['test1.com', 'test2.com', 'test3.com', 'test4.com'],
    });

    expect(response.statusCode).to.eql(201);
  });
});

describe('constructPhotoQueries', () => {
  it('makes postgres query string for array of photos', () => {
    const photos = ['test1.com', 'test2.com', 'test3.com', 'test4.com'];
    const result = dbHelpers.constructPhotoQueries(photos);
    expect(result).to.include('test1.com');
  });
});

describe('constructCharacteristicQueries', () => {
  it('makes postgres query string for object of characteristics', () => {
    const characteristics = {
      158622: 1, 158623: 1, 158624: 1, 158625: 1,
    };
    const result = dbHelpers.constructCharacteristicQueries(characteristics);
    expect(result).to.include('158622');
  });
});

describe('db getReviews', () => {
  it('returns reviews from db', () => {
    db.getReviews(47421)
      .then((result) => {
        expect(result).to.not.eql(null);
      });
  });
});

describe('db markReviewHelpful', () => {
  it('marks review helpful', () => {
    db.markReviewHelpful(273027)
      .then((result) => {
        expect(result).to.not.eql(null);
      });
  });
});

describe('db reportReview', () => {
  it('reports review', () => {
    db.reportReview(47421)
      .then((result) => {
        expect(result).to.not.eql(null);
      });
  });
});

describe('db postNewReview', () => {
  it('posts new review', () => {
    const data = {
      product_id: 50000,
      rating: 5,
      summary: 'MOCHACHAITEST????',
      body: 'MOCHACHAITESTING????',
      recommend: true,
      name: 'test',
      email: 'test@test.com',
      characteristics: {
        158622: 1, 158623: 1, 158624: 1, 158625: 1,
      },
      photos: ['test1.com', 'test2.com', 'test3.com', 'test4.com'],
    };

    db.postNewReview(data)
      .then((result) => {
        expect(result).to.not.eql(null);
      });
  });
});

describe('formatReview', () => {
  it('formats reviews', () => {
    const result = reviewsHelpers.formatReviews(sampleData, 47421);
    expect(result.results.length).to.not.eql(0);
  });
});
