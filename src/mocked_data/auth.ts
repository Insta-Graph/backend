import { AuthResolver } from 'resolvers';
import { ExtractFunctionKeys, RepositoryMock } from 'types/graph';
import { MOCKED_EMAIL, MOCKED_PASSWORD, MOCKED_REGISTERED_USER } from './user';

type MyActions = ExtractFunctionKeys<AuthResolver>;

export const MOCKED_LOGIN = {
  email: MOCKED_EMAIL,
  password: MOCKED_PASSWORD,
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
};
