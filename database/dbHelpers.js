/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-plusplus */
const constructPhotoQueries = (photos) => {
  if (!photos) {
    return '';
  }

  let output = `
  ,ins2 AS (
    INSERT INTO reviews_photos(review_id, url)
    VALUES
  `;

  for (let i = 0; i < photos.length; i++) {
    const str = `((SELECT id FROM ins1), '${photos[i]}'),`;

    output += str;
  }

  output = output.slice(0, -1);
  output += ')';

  return output;
};

const constructCharacteristicQueries = (chars) => {
  let output = 'VALUES ';

  for (const key in chars) {
    const str = `(${key}, (SELECT id FROM ins1), ${chars[key]}),`;

    output += str;
  }

  return output.slice(0, -1);
};

module.exports = {
  constructPhotoQueries,
  constructCharacteristicQueries,
};
