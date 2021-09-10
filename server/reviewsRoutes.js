const express = require('express');

const reviewsRouter = express.Router();
const reviewsController = require('./reviewsController');

reviewsRouter.get('/product/:productId/', reviewsController.getReviews);

reviewsRouter.put('/:reviewId/helpful', reviewsController.markReviewHelpful);
reviewsRouter.put('/:reviewId/report', reviewsController.reportReview);

reviewsRouter.post('/', reviewsController.postNewReview);

module.exports = reviewsRouter;
