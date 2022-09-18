import { AuthResolver } from 'resolvers';
import { ExtractFunctionKeys, RepositoryMock } from 'types/graph';
import { TOKEN_RESET_EXPIRATION } from '../constants/index';
import { MOCKED_EMAIL, MOCKED_PASSWORD, MOCKED_REGISTERED_USER, MOCKED_USER_ID } from './user';

type MyActions = ExtractFunctionKeys<AuthResolver>;

export const MOCKED_LOGIN = {
  email: MOCKED_EMAIL,
  password: MOCKED_PASSWORD,
};

export const MOCKED_RESET_PASSWORD = {
  email: MOCKED_EMAIL,
  password: MOCKED_PASSWORD,
  token: MOCKED_USER_ID,
};

export const MOCKED_REGISTERED_USER_WITH_RESET_TOKEN = {
  ...MOCKED_REGISTERED_USER,
  resetToken: MOCKED_USER_ID,
  resetTokenValidity: Date.now() + TOKEN_RESET_EXPIRATION * 1000,
};

export const MOCKED_REGISTERED_USER_WITH_RESET_TOKEN_EXPIRED = {
  ...MOCKED_REGISTERED_USER,
  resetToken: MOCKED_USER_ID,
  resetTokenValidity: Date.now(),
};

export const authRepositorySuccessfulMocks: RepositoryMock<MyActions> = {
  login: (repositoryStub) => {
    repositoryStub.findOneBy.resolves({
      ...MOCKED_REGISTERED_USER,
    });
  },
  changePassword: (repositoryStub) => {
    repositoryStub.findOneByOrFail.resolves({
      ...MOCKED_REGISTERED_USER,
    });
    repositoryStub.update.resolves();
  },
  logout: (repositoryStub) => {
    repositoryStub.increment.resolves();
  },
  forgotPassword: (repositoryStub) => {
    repositoryStub.findOneBy.resolves({
      ...MOCKED_REGISTERED_USER,
    });
    repositoryStub.update.resolves();
  },
  resetPassword: (repositoryStub) => {
    repositoryStub.findOneBy.resolves({
      ...MOCKED_REGISTERED_USER_WITH_RESET_TOKEN,
    });
    repositoryStub.update.resolves();
  },
};

export const authRepositoryUnsuccessfullyMocks: RepositoryMock<MyActions> = {
  login: (repositoryStub) => {
    repositoryStub.findOneBy.resolves(null);
  },
  logout: (repositoryStub) => {
    repositoryStub.increment.resolves();
  },
  changePassword: (repositoryStub) => {
    repositoryStub.findOneByOrFail.resolves({
      ...MOCKED_REGISTERED_USER,
    });
  },
  forgotPassword: (repositoryStub) => {
    repositoryStub.findOneBy.resolves({
      ...MOCKED_REGISTERED_USER,
    });
    repositoryStub.update.resolves();
  },
  resetPassword: (repositoryStub) => {
    repositoryStub.findOneBy.resolves(null);
  },
};
