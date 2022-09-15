import User from 'entity/User';
import { MOCKED_REGISTERED_USER } from 'mocked_data/user';
import { setupTestingContainer, gCall } from 'mocked_data/utils';
import Container from 'typedi';
import argon2 from 'argon2';
import sinon from 'sinon';
import {
  authRepositorySuccessfulMocks,
  authRepositoryUnsuccessfullyMocks,
  MOCKED_LOGIN,
} from 'mocked_data/auth';

describe('Auth Resolver', () => {
  const argonStub = sinon.stub(argon2);

  beforeEach(() => {
    Container.reset();
  });

  it('should login user', async () => {
    argonStub.verify.resolves(true);

    setupTestingContainer({
      methodToMock: authRepositorySuccessfulMocks.login,
      entityName: User.name,
    });

    const loginMutation = `
      mutation login($data: LoginInput!) {
        login(
          input: $data
        ) {
          ... on ErrorResponse {
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
              refreshToken
              expiresIn
            }
          }
        }
      }
    `;

    const response = await gCall({
      source: loginMutation,
      variableValues: {
        data: { ...MOCKED_LOGIN },
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
  });

  it('should reject when user does not exist', async () => {
    setupTestingContainer({
      methodToMock: authRepositoryUnsuccessfullyMocks.login,
      entityName: User.name,
    });

    const loginMutation = `
      mutation login($data: LoginInput!) {
        login(
          input: $data
        ) {
          ... on ErrorResponse {
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
              refreshToken
              expiresIn
            }
          }
        }
      }
    `;

    const response = await gCall({
      source: loginMutation,
      variableValues: {
        data: { ...MOCKED_LOGIN },
      },
    });

    expect(response).toMatchObject({
      data: {
        login: { success: false, message: 'user does not exist' },
      },
    });
  });

  it('should reject when password does not match', async () => {
    argonStub.verify.resolves(false);

    setupTestingContainer({
      methodToMock: authRepositorySuccessfulMocks.login,
      entityName: User.name,
    });

    const loginMutation = `
      mutation login($data: LoginInput!) {
        login(
          input: $data
        ) {
          ... on ErrorResponse {
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
              refreshToken
              expiresIn
            }
          }
        }
      }
    `;

    const response = await gCall({
      source: loginMutation,
      variableValues: {
        data: { ...MOCKED_LOGIN },
      },
    });

    expect(response).toMatchObject({
      data: {
        login: { success: false, message: 'password is incorrect' },
      },
    });
  });
});
