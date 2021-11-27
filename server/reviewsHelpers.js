/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-plusplus */

const extractPhotos = (reviews) => {
  const photos = [];
  const tracker = [];

  for (let i = 0; i < reviews.length; i++) {
    const item = reviews[i];

    const obj = {
      id: item.photo_id,
      url: item.photo_url,
    };

    if (!tracker.includes(item.photo_url) && item.photo_url) {
      photos.push(obj);
    }

    tracker.push(item.photo_url);
  }

  return photos;
};

const extractCharacteristics = (reviews) => {
  const chars = {};

  for (let i = 0; i < reviews.length; i++) {
    const item = reviews[i];

    if (!chars[item.characteristics_name]) {
      chars[item.characteristics_name] = [
        item.characteristics_id,
        item.characteristics_value,
      ];
    } else if (chars[item.characteristics_name]) {
      chars[item.characteristics_name].push(item.characteristics_value);
    }
  }

  const getAverage = (arr) => arr.reduce((acc, n) => acc + n) / arr.length;

  for (const key in chars) {
    const item = chars[key];
    const obj = { id: 0, value: '' };

    [obj.id] = item;
    obj.value = getAverage(item.slice(1)).toString();

    chars[key] = obj;
  }

  return chars;
};

const constructMeta = (reviews, tracker, productId) => {
  const reviewsUniq = [];

  for (const key in tracker) {
    reviewsUniq.push(tracker[key][0]);
  }

  const meta = {
    product_id: productId.toString(),
    ratings: {},
    recommended: {
      true: 0,
      false: 0,
    },
    characteristics: extractCharacteristics(reviews),
  };

  for (let i = 0; i < reviewsUniq.length; i++) {
    const item = reviewsUniq[i];

    if (!meta.ratings[item.rating]) {
      meta.ratings[item.rating] = 1;
    } else if (meta.ratings[item.rating]) {
      meta.ratings[item.rating]++;
    }

    for (const key in meta.ratings) {
      meta.ratings[key] = meta.ratings[key].toString();
    }

    meta.recommended[item.recommend]++;
  }

  return meta;
};

const formatReviews = (result, productId, sortMethod, count) => {
  const output = {
    product: productId,
    productName: '',
    count: count || 0,
    meta: {},
    results: [],
  };

  output.productName = result[0].product_name;

  const reviewsTracker = {};

  for (let i = 0; i < result.length; i++) {
    const item = result[i];

    if (!reviewsTracker[item.reviews_id]) {
      reviewsTracker[item.reviews_id] = [item];
    } else if (reviewsTracker[item.reviews_id]) {
      reviewsTracker[item.reviews_id].push(item);
    }
  }

  output.meta = constructMeta(result, reviewsTracker, productId);

  for (const review in reviewsTracker) {
    const item = reviewsTracker[review][0];

    if (!item.reported) {
      if (item.response === 'null') {
        item.response = null;
      }

      const reviewObj = {
        review_id: item.reviews_id,
        rating: item.rating,
        summary: item.summary,
        recommend: item.recommend,
        response: item.response,
        body: item.body,
        date: JSON.stringify(item.date).slice(1, -1),
        reviewer_name: item.reviewer_name,
        helpfulness: item.helpfulness,
        photos: extractPhotos(reviewsTracker[review]),
      };

      output.results.push(reviewObj);
    }
  }

  if (sortMethod === 'newest') {
    output.results.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  }

  if (count) {
    output.results = output.results.slice(0, count);
  }

  return output;
};

module.exports = {
  formatReviews,
  extractPhotos,
  extractCharacteristics,
  constructMeta,
};
