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

const constructPhotoQueries = (photos) => {
  let output = 'VALUES ';

  for (let i = 0; i < photos.length; i++) {
    const count = i + 1;
    const str = `((SELECT max(id) FROM reviews_photos) + ${count}, (SELECT id FROM ins1), '${photos[i]}'),`;

    output += str;
  }

  return output.slice(0, -1);
};

const constructCharacteristicQueries = (chars) => {
  let output = 'VALUES ';
  let count = 1;

  for (const key in chars) {
    const str = `((SELECT max(id) FROM reviews_characteristics) + ${count}, ${key}, (SELECT id FROM ins1), ${chars[key]}),`;

    output += str;
    count++;
  }

  return output.slice(0, -1);
};

module.exports = {
  extractPhotos,
  extractCharacteristics,
  constructMeta,
  constructPhotoQueries,
  constructCharacteristicQueries,
};
