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
};

export const authRepositoryUnsuccessfullyMocks: RepositoryMock<MyActions> = {
  login: (repositoryStub) => {
    repositoryStub.findOneBy.resolves(null);
  },
};
