/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-plusplus */
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
  constructPhotoQueries,
  constructCharacteristicQueries,
};
