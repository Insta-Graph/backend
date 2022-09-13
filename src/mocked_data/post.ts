import { faker } from '@faker-js/faker';

export const MOCKED_POST_ID = faker.datatype.uuid();

export const MOCKED_POST = {
  _id: MOCKED_POST_ID,
  title: faker.random.words(3),
  text: faker.random.words(6),
};

export const MOCKED_POSTS = [
  ...new Array(3).fill(null).map(() => ({
    _id: faker.datatype.uuid(),
    title: faker.random.words(3),
    text: faker.random.words(6),
  })),
  MOCKED_POST,
];
