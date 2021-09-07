/* eslint-disable no-undef */
const { expect } = require('chai');
const chai = require('chai');
const request = require('supertest')('http://localhost:8080/reviews');

const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const app = require('../server/server');

const port = 8000;

const sampleData = require('./mockData');

const db = require('../database/index');
const dbHelpers = require('../database/dbHelpers');
const reviewsHelpers = require('../server/reviewsHelpers');

describe('server routes', () => {
  it('get route returns product info', (done) => {
    chai.request(app)
      .get('/reviews/product/47421')
      .end((err, res) => {
        expect(res.text).to.include('Rhett Jacket');
        expect(res.text).to.include('47421');
        done();
      });
  });

  it('mark review helpful route', (done) => {
    chai.request(app)
      .put('/reviews/50000/helpful')
      .end((err, res) => {
        expect(res.statusCode).to.eql(204);
        done();
      });
  });

  it('report review route', (done) => {
    chai.request(app)
      .put('/reviews/50000/report')
      .end((err, res) => {
        expect(res.statusCode).to.eql(204);
        done();
      });
  });

  it('post review route', (done) => {
    chai.request(app)
      .post('/reviews/')
      .send({
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
      })
      .end((err, res) => {
        expect(res.statusCode).to.eql(201);
        done();
      });
  });
});

describe('GET /reviews', () => {
  let server;

  beforeEach(() => {
    server = app.listen(port, () => {});
  });

  afterEach(() => {
    server.close();
  });

  it('returns correct reviews in correct format for valid product id 47421', async () => {
    const response = await request.get('/product/47421');
    expect(response.body.product).to.eql('47421');
    expect(response.body.results.length).to.not.eql(0);
  });

  it('returns correct reviews in correct format for valid product id 47425', async () => {
    const response = await request.get('/product/47425');
    expect(response.body.product).to.eql('47425');
    expect(response.body.results.length).to.not.eql(0);
  });

  it('returns correct reviews in correct format for valid product id 50001', async () => {
    const response = await request.get('/product/50001');
    expect(response.body.product).to.eql('50001');
    expect(response.body.results.length).to.not.eql(0);
  });

  it('returns correct reviews in correct format for valid product id 1', async () => {
    const response = await request.get('/product/1');
    expect(response.body.product).to.eql('1');
    expect(response.body.results.length).to.not.eql(0);
  });

  it('returns correct reviews in correct format for valid product id 100000', async () => {
    const response = await request.get('/product/100000');
    expect(response.body.product).to.eql('100000');
    expect(response.body.results.length).to.not.eql(0);
  });
});

describe('mark review helpful', () => {
  let server;

  beforeEach(() => {
    server = app.listen(port, () => {});
  });

  afterEach(() => {
    server.close();
  });

  it('successfully marks review helpful', async () => {
    const response = await request.put('/27027/helpful');
    expect(response.statusCode).to.eql(204);
  });
});

describe('report review', () => {
  let server;

  beforeEach(() => {
    server = app.listen(port, () => {});
  });

  afterEach(() => {
    server.close();
  });

  it('successfully reports review', async () => {
    const response = await request.put('/27027/report');
    expect(response.statusCode).to.eql(204);
  });
});

describe('POST new review', () => {
  let server;

  beforeEach(() => {
    server = app.listen(port, () => {});
  });

  afterEach(() => {
    server.close();
  });

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

describe('formatReview', () => {
  it('formats reviews', () => {
    const result = reviewsHelpers.formatReviews(sampleData, 47421);
    expect(result.results.length).to.not.eql(0);
  });
});

describe('db getReviews', () => {
  afterEach(() => {
    db.db.$pool.end();
  });

  it('returns correct reviews from db', () => {
    db.getReviews(47421)
      .then((result) => {
        expect(result[0].product_name).to.eql('Rhett Jacket');
      });
  });
});

describe('db markReviewHelpful', () => {
  afterEach(() => {
    db.db.$pool.end();
  });

  it('marks review helpful', () => {
    db.markReviewHelpful(273027)
      .then((result) => {
        expect(result).to.not.eql(null);
      });
  });
});

describe('db reportReview', () => {
  afterEach(() => {
    db.db.$pool.end();
  });

  it('reports review', () => {
    db.reportReview(47421)
      .then((result) => {
        expect(result).to.not.eql(null);
      });
  });
});

describe('db postNewReview', () => {
  afterEach(() => {
    db.db.$pool.end();
  });

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
        expect(result[0].review_id).to.not.eql(null);
      });
  });
});
