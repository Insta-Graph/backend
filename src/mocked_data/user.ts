import { faker } from '@faker-js/faker';
import { UserResolver } from 'resolvers';

import { ExtractFunctionKeys, RepositoryMock } from '../types/graph';

export const MOCKED_EMAIL = faker.internet.email();

export const MOCKED_PASSWORD = `${faker.internet.password()}/_aA3`;

export const MOCKED_FIRST_NAME = faker.name.firstName();

export const MOCKED_LAST_NAME = faker.name.lastName();

export const MOCKED_USER_ID = faker.datatype.uuid();

export const MOCKED_REGISTER = {
  email: MOCKED_EMAIL,
  password: MOCKED_PASSWORD,
  firstName: MOCKED_FIRST_NAME,
  lastName: MOCKED_LAST_NAME,
};

export const MOCKED_REGISTERED_USER = {
  _id: MOCKED_USER_ID,
  avatar: null,
  firstName: MOCKED_FIRST_NAME,
  lastName: MOCKED_LAST_NAME,
  email: MOCKED_EMAIL,
  username: `${MOCKED_FIRST_NAME} ${MOCKED_LAST_NAME}`,
};

export const MOCKED_REGISTERED_USER_WITH_TOKEN = {
  _id: MOCKED_USER_ID,
  avatar: null,
  firstName: MOCKED_FIRST_NAME,
  lastName: MOCKED_LAST_NAME,
  email: MOCKED_EMAIL,
  username: `${MOCKED_FIRST_NAME} ${MOCKED_LAST_NAME}`,
  tokenVersion: 0,
};

export const MOCKED_USERS = [
  ...new Array(3).fill(null).map(() => ({
    _id: faker.datatype.uuid(),
    avatar: null,
    firstName: faker.name.firstName(),
    lastName: faker.name.firstName(),
    email: faker.internet.email(),
    username: faker.internet.userName(),
  })),
  MOCKED_REGISTERED_USER,
];

type MyActions = ExtractFunctionKeys<UserResolver>;

export const userRepositoryMocks: RepositoryMock<MyActions> = {
  registerUser: (repositoryStub) => {
    repositoryStub.findOneBy.resolves(null);
    repositoryStub.create.returns({
      ...MOCKED_REGISTERED_USER_WITH_TOKEN,
    });
    repositoryStub.save.resolves();
  },
  updateUser: (repositoryStub) => {
    repositoryStub.findOneByOrFail.resolves({ ...MOCKED_REGISTERED_USER_WITH_TOKEN });
    repositoryStub.update.resolves();
  },
  getUserById(repositoryStub) {
    repositoryStub.findOneByOrFail.resolves({ ...MOCKED_REGISTERED_USER_WITH_TOKEN });
  },
  getUsers(repositoryStub) {
    repositoryStub.find.resolves([...MOCKED_USERS]);
  },
};

export const userRepositoryUnsuccessfullyMocks: RepositoryMock<'registerUser'> = {
  registerUser: (repositoryStub) => {
    repositoryStub.findOneBy.resolves({
      ...MOCKED_REGISTERED_USER_WITH_TOKEN,
    });
  },
};
