import measured from 'measured';

export const json = { padding: 2 };

export const stats = measured.createCollection();

export const log = (...params) => {
  // eslint-disable-next-line no-console
  console.log(...params);
};
