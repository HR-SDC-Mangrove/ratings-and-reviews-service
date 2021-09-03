const express = require('express');

const reviewsRouter = express.Router();
const reviewsController = require('./reviewsController');

reviewsRouter.get('/product/:productId/', reviewsController.getReviews);
reviewsRouter.get('/product/:productId/:sortMethod', reviewsController.getReviews);

reviewsRouter.put('/:reviewId/helpful', reviewsController.markReviewHelpful);

module.exports = reviewsRouter;
