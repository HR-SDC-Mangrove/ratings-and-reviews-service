const express = require('express');

const reviewsRouter = express.Router();
const reviewsController = require('./reviewsController');

reviewsRouter.get('/:productId/', reviewsController.reviews);
reviewsRouter.get('/:productId/:sortMethod', reviewsController.reviews);

module.exports = reviewsRouter;
