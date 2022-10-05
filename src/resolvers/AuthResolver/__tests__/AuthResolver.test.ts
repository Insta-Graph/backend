import User from 'entity/User';
import { MOCKED_CHANGE_PASSWORD, MOCKED_REGISTERED_USER, MOCKED_USER_ID } from 'mocked_data/user';
import { gCallWithRepositoryMock } from 'mocked_data/utils';
import Container from 'typedi';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import httpMocks from 'node-mocks-http';
import MockSES from 'aws-sdk/clients/ses';
import sinon from 'sinon';
import {
  authRepositorySuccessfulMocks,
  authRepositoryUnsuccessfullyMocks,
  MOCKED_LOGIN,
  MOCKED_REGISTERED_USER_WITH_RESET_TOKEN_EXPIRED,
} from 'mocked_data/auth';
import { generateAccessToken } from 'utils/auth';
import { MOCKED_RESET_PASSWORD } from '../../../mocked_data/auth';
import { MOCKED_EMAIL } from '../../../mocked_data/user';

// COMMON MUTATIONS
const changePasswordMutation = `
      mutation changePassword($data: ChangePasswordInput!) {
        changePassword(
          input: $data
        ) {
          success
          message
        }
      }
    `;

const logoutMutation = `
      mutation Logout {
        logout {
          success
          message
        }
      }
    `;

const forgotPasswordMutation = `
      mutation ForgotPassword($data: ForgotPasswordInput!) {
        forgotPassword(
          input: $data
        ) {
          success
          message
        }
      }
    `;

const resetPasswordMutation = `
      mutation ResetPassword($data: ResetPasswordInput!) {
        resetPassword(
          input: $data
        ) {
          success
          message
        }
      }
    `;

const loginMutation = `
      mutation login($data: LoginInput!) {
        login(
          input: $data
        ) {
          ... on ResponseStatus {
            success
            message
          }
          ... on AuthData {
            user {
              _id
              avatar
              username
              firstName
              lastName
              email
            }
            auth {
              accessToken
              expiresIn
            }
          }
        }
      }
    `;

jest.mock('aws-sdk/clients/ses', () => {
  const mSES = {
    sendTemplatedEmail: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return jest.fn(() => mSES);
});

describe('Auth Resolver', () => {
  const argonStub = sinon.stub(argon2);

  it('should login user', async () => {
    argonStub.verify.resolves(true);

    const containerId = uuidv4();

    const mockedExpressResponse = httpMocks.createResponse();

    const response = await gCallWithRepositoryMock({
      source: loginMutation,
      variableValues: {
        data: { ...MOCKED_LOGIN },
      },
      repositoryMockedData: {
        methodToMock: authRepositorySuccessfulMocks.login,
        entityName: User.name,
      },
      containerId,
      contextValue: {
        res: mockedExpressResponse,
      },
    });

    expect(response).toMatchObject({
      data: {
        login: {
          user: { ...MOCKED_REGISTERED_USER },
        },
      },
    });
    expect(response.data?.login).toHaveProperty('auth');
    expect(response.data?.login.auth).toHaveProperty('accessToken');
    expect(response.data?.login.auth).toHaveProperty('expiresIn');
    expect(mockedExpressResponse.cookies.pub).toBeDefined();
    expect(mockedExpressResponse.cookies.pub).toHaveProperty('value');
    expect(mockedExpressResponse.cookies.pub).toHaveProperty('options.httpOnly', true);
    expect(mockedExpressResponse.cookies.pub).toHaveProperty('options.path', '/refresh-token');

    Container.reset(containerId);
  });

  it('should reject login when user does not exist', async () => {
    const containerId = uuidv4();
    const mockedExpressResponse = httpMocks.createResponse();

    const response = await gCallWithRepositoryMock({
      source: loginMutation,
      variableValues: {
        data: { ...MOCKED_LOGIN },
      },
      repositoryMockedData: {
        methodToMock: authRepositoryUnsuccessfullyMocks.login,
        entityName: User.name,
      },
      containerId,
      contextValue: {
        res: mockedExpressResponse,
      },
    });

    expect(response).toMatchObject({
      data: {
        login: { success: false, message: 'user does not exist' },
      },
    });
    expect(mockedExpressResponse.cookies.pub).not.toBeDefined();
    Container.reset(containerId);
  });

  it('should reject when password does not match', async () => {
    argonStub.verify.resolves(false);
    const containerId = uuidv4();
    const mockedExpressResponse = httpMocks.createResponse();

    const response = await gCallWithRepositoryMock({
      source: loginMutation,
      variableValues: {
        data: { ...MOCKED_LOGIN },
      },
      repositoryMockedData: {
        methodToMock: authRepositorySuccessfulMocks.login,
        entityName: User.name,
      },
      containerId,
      contextValue: {
        res: mockedExpressResponse,
      },
    });

    expect(response).toMatchObject({
      data: {
        login: { success: false, message: 'password is incorrect' },
      },
    });
    expect(mockedExpressResponse.cookies.pub).not.toBeDefined();

    Container.reset(containerId);
  });

  it('should change password successfully', async () => {
    argonStub.verify.resolves(true);
    argonStub.hash.resolves('');
    const containerId = uuidv4();

    const signedToken = generateAccessToken(MOCKED_USER_ID);

    const mockedExpressRequest = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${signedToken}`,
      },
    });

    const response = await gCallWithRepositoryMock({
      source: changePasswordMutation,
      variableValues: {
        data: { ...MOCKED_CHANGE_PASSWORD },
      },
      repositoryMockedData: {
        methodToMock: authRepositorySuccessfulMocks.changePassword,
        entityName: User.name,
      },
      containerId,
      contextValue: {
        req: mockedExpressRequest,
      },
    });

    expect(response).toMatchObject({
      data: {
        changePassword: { success: true, message: 'new password set successfully' },
      },
    });
    Container.reset(containerId);
  });

  it('should reject change password when old password does not match', async () => {
    argonStub.verify.resolves(false);
    const containerId = uuidv4();

    const signedToken = generateAccessToken(MOCKED_USER_ID);

    const mockedExpressRequest = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${signedToken}`,
      },
    });

    const response = await gCallWithRepositoryMock({
      source: changePasswordMutation,
      variableValues: {
        data: { ...MOCKED_CHANGE_PASSWORD },
      },
      repositoryMockedData: {
        methodToMock: authRepositoryUnsuccessfullyMocks.changePassword,
        entityName: User.name,
      },
      containerId,
      contextValue: {
        req: mockedExpressRequest,
      },
    });

    expect(response).toMatchObject({
      data: {
        changePassword: { success: false, message: 'your current password is incorrect' },
      },
    });
    Container.reset(containerId);
  });

  it('should logout user', async () => {
    const containerId = uuidv4();

    const signedToken = generateAccessToken(MOCKED_USER_ID);

    const mockedExpressRequest = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${signedToken}`,
      },
    });

    const mockedExpressResponse = httpMocks.createResponse();

    const response = await gCallWithRepositoryMock({
      source: logoutMutation,
      repositoryMockedData: {
        methodToMock: authRepositorySuccessfulMocks.logout,
        entityName: User.name,
      },
      containerId,
      contextValue: {
        req: mockedExpressRequest,
        res: mockedExpressResponse,
      },
    });

    expect(response).toMatchObject({
      data: {
        logout: {
          success: true,
          message: 'successfully logged out',
        },
      },
    });

    expect(mockedExpressResponse.cookies.pub).toBeDefined();
    expect(mockedExpressResponse.cookies.pub).toHaveProperty('value', '');
    expect(mockedExpressResponse.cookies.pub).toHaveProperty('options.httpOnly', true);
    expect(mockedExpressResponse.cookies.pub).toHaveProperty('options.path', '/refresh-token');

    Container.reset(containerId);
  });

  describe('forgotPassword', () => {
    it('should send confirmation email correctly', async () => {
      argonStub.hash.resolves('');
      const mSes = new MockSES();
      // @ts-ignore
      mSes.sendTemplatedEmail().promise.mockResolvedValue({ MessageId: 'MOCK' });

      const containerId = uuidv4();

      const response = await gCallWithRepositoryMock({
        source: forgotPasswordMutation,
        variableValues: {
          data: { email: MOCKED_EMAIL },
        },
        repositoryMockedData: {
          methodToMock: authRepositorySuccessfulMocks.forgotPassword,
          entityName: User.name,
        },
        containerId,
      });

      expect(response).toMatchObject({
        data: {
          forgotPassword: { success: true, message: 'An email was sent with next steps' },
        },
      });
      Container.reset(containerId);
    });
  });

  describe('resetPassword', () => {
    it('should change password correctly', async () => {
      argonStub.verify.resolves(true);
      argonStub.hash.resolves('');

      const containerId = uuidv4();

      const response = await gCallWithRepositoryMock({
        source: resetPasswordMutation,
        variableValues: {
          data: { ...MOCKED_RESET_PASSWORD },
        },
        repositoryMockedData: {
          methodToMock: authRepositorySuccessfulMocks.resetPassword,
          entityName: User.name,
        },
        containerId,
      });

      expect(response).toMatchObject({
        data: {
          resetPassword: { success: true, message: 'Password successfully changed' },
        },
      });
      Container.reset(containerId);
    });

    it('should reject when user does not exist', async () => {
      const containerId = uuidv4();

      const response = await gCallWithRepositoryMock({
        source: resetPasswordMutation,
        variableValues: {
          data: { ...MOCKED_RESET_PASSWORD },
        },
        repositoryMockedData: {
          methodToMock: authRepositoryUnsuccessfullyMocks.resetPassword,
          entityName: User.name,
        },
        containerId,
      });

      expect(response).toMatchObject({
        data: {
          resetPassword: { success: false, message: 'User does not exist' },
        },
      });
      Container.reset(containerId);
    });

    it('should reject when token is not valid', async () => {
      argonStub.verify.resolves(false);

      const containerId = uuidv4();

      const response = await gCallWithRepositoryMock({
        source: resetPasswordMutation,
        variableValues: {
          data: { ...MOCKED_RESET_PASSWORD },
        },
        repositoryMockedData: {
          methodToMock: authRepositorySuccessfulMocks.resetPassword,
          entityName: User.name,
        },
        containerId,
      });

      expect(response).toMatchObject({
        data: {
          resetPassword: { success: false, message: 'Invalid verification, please try again.' },
        },
      });
      Container.reset(containerId);
    });

    it('should reject when token is expired', async () => {
      argonStub.verify.resolves(true);

      const containerId = uuidv4();

      const response = await gCallWithRepositoryMock({
        source: resetPasswordMutation,
        variableValues: {
          data: { ...MOCKED_RESET_PASSWORD },
        },
        repositoryMockedData: {
          methodToMock: (repositoryStub) => {
            repositoryStub.findOneBy.resolves({
              ...MOCKED_REGISTERED_USER_WITH_RESET_TOKEN_EXPIRED,
            });
          },
          entityName: User.name,
        },
        containerId,
      });

      expect(response).toMatchObject({
        data: {
          resetPassword: { success: false, message: 'Invalid verification, please try again.' },
        },
      });
      Container.reset(containerId);
    });
  });
});
