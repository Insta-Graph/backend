import User from 'entity/User';
import { MOCKED_REGISTERED_USER } from 'mocked_data/user';
import { gCallWithRepositoryMock } from 'mocked_data/utils';
import Container from 'typedi';
import argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import httpMocks from 'node-mocks-http';

import sinon from 'sinon';
import {
  authRepositorySuccessfulMocks,
  authRepositoryUnsuccessfullyMocks,
  MOCKED_LOGIN,
} from 'mocked_data/auth';

describe('Auth Resolver', () => {
  const argonStub = sinon.stub(argon2);

  it('should login user', async () => {
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

    Container.reset(containerId);
  });

  it('should reject login when user does not exist', async () => {
    const containerId = uuidv4();
    const mockedExpressResponse = httpMocks.createResponse();

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
});
