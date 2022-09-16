import User from 'entity/User';
import { MOCKED_REGISTERED_USER } from 'mocked_data/user';
import { gCallWithRepositoryMock } from 'mocked_data/utils';
import Container from 'typedi';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';

import sinon from 'sinon';
import {
  authRepositorySuccessfulMocks,
  authRepositoryUnsuccessfullyMocks,
  MOCKED_LOGIN,
} from 'mocked_data/auth';

describe('Auth Resolver', () => {
  const argonStub = sinon.stub(argon2);

  xit('should login user', async () => {
    argonStub.verify.resolves(true);

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
              expiresIn
            }
          }
        }
      }
    `;
    const containerId = uuidv4();

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
    });

    expect(response).toMatchObject({
      data: {
        login: {
          user: { ...MOCKED_REGISTERED_USER },
        },
      },
    });
    expect(response.data?.login).toHaveProperty('auth');

    Container.reset(containerId);
  });

  xit('should reject login when user does not exist', async () => {
    const containerId = uuidv4();

    const loginMutation = `
      mutation Login($data: LoginInput!) {
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
              expiresIn
            }
          }
        }
      }
    `;

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
    });

    expect(response).toMatchObject({
      data: {
        login: { success: false, message: 'user does not exist' },
      },
    });
    Container.reset(containerId);
  });

  xit('should reject when password does not match', async () => {
    argonStub.verify.resolves(false);
    const containerId = uuidv4();

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
              expiresIn
            }
          }
        }
      }
    `;

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
    });

    expect(response).toMatchObject({
      data: {
        login: { success: false, message: 'password is incorrect' },
      },
    });
    Container.reset(containerId);
  });
});
