import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import User from 'entity/User';
import {
  MOCKED_REGISTER,
  MOCKED_REGISTERED_USER,
  MOCKED_USERS,
  MOCKED_USER_ID,
  userRepositoryMocks,
  userRepositoryUnsuccessfullyMocks,
} from 'mocked_data/user';
import { gCallWithRepositoryMock } from 'mocked_data/utils';
import Container from 'typedi';
import { generateAccessToken } from 'utils/auth';
import { v4 as uuidv4 } from 'uuid';
import sinon from 'sinon';
import httpMocks from 'node-mocks-http';
import { ACCESS_TOKEN_SECRET } from '../../../constants';

const registerUserMutation = `
      mutation RegisterUser($data: UserCreateInput!) {
        registerUser(
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

const updateUserMutation = `
    mutation UpdateUser($data: UserUpdateInput!) {
      updateUser(
        options: $data
      ) {
        _id
        avatar
        username
        firstName
        lastName
        email
      }
    }
  `;

describe('User Resolver', () => {
  it('registerUser', async () => {
    const containerId = uuidv4();

    const mockedExpressRequest = httpMocks.createRequest();
    const mockedExpressResponse = httpMocks.createResponse();

    const response = await gCallWithRepositoryMock({
      source: registerUserMutation,
      variableValues: {
        data: { ...MOCKED_REGISTER },
      },
      repositoryMockedData: {
        methodToMock: userRepositoryMocks.registerUser,
        entityName: User.name,
      },
      containerId,
      contextValue: {
        req: mockedExpressRequest,
        res: mockedExpressResponse,
      },
    });

    // eslint-disable-next-line no-console
    console.log(JSON.stringify(response));

    expect(response).toMatchObject({
      data: {
        registerUser: {
          user: { ...MOCKED_REGISTERED_USER },
        },
      },
    });
    expect(response.data?.registerUser).toHaveProperty('auth');
    expect(mockedExpressResponse.cookies.pub).toBeDefined();
    expect(mockedExpressResponse.cookies.pub).toHaveProperty('value');
    expect(mockedExpressResponse.cookies.pub).toHaveProperty('options.httpOnly', true);
    expect(mockedExpressResponse.cookies.pub).toHaveProperty('options.path', '/refresh-token');

    Container.reset(containerId);
  });

  it('should not create user when already exists', async () => {
    const containerId = uuidv4();
    const mockedExpressRequest = httpMocks.createRequest();
    const mockedExpressResponse = httpMocks.createResponse();

    const response = await gCallWithRepositoryMock({
      source: registerUserMutation,
      variableValues: {
        data: { ...MOCKED_REGISTER },
      },
      repositoryMockedData: {
        methodToMock: userRepositoryUnsuccessfullyMocks.registerUser,
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
        registerUser: { success: false, message: 'user already exists' },
      },
    });
    Container.reset(containerId);
  });

  it('updateUser', async () => {
    const containerId = uuidv4();

    const updatedUser = {
      username: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const signedToken = generateAccessToken(MOCKED_USER_ID);

    const mockedExpressRequest = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${signedToken}`,
      },
    });

    const response = await gCallWithRepositoryMock({
      source: updateUserMutation,
      variableValues: {
        id: MOCKED_USER_ID,
        data: updatedUser,
      },
      contextValue: {
        req: mockedExpressRequest,
      },
      repositoryMockedData: {
        methodToMock: userRepositoryMocks.updateUser,
        entityName: User.name,
      },
      containerId,
    });

    expect(response).toMatchObject({
      data: {
        updateUser: {
          ...MOCKED_REGISTERED_USER,
          ...updatedUser,
        },
      },
    });
    Container.reset(containerId);
  });

  it('should reject updateUser when token is not valid', async () => {
    const containerId = uuidv4();

    const updatedUser = {
      username: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const mockedExpressRequest = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${faker.datatype.uuid()}`,
      },
    });

    const response = await gCallWithRepositoryMock({
      source: updateUserMutation,
      variableValues: {
        id: MOCKED_USER_ID,
        data: updatedUser,
      },
      contextValue: {
        req: mockedExpressRequest,
      },
      repositoryMockedData: {
        methodToMock: userRepositoryMocks.updateUser,
        entityName: User.name,
      },
      containerId,
    });

    expect(response).toMatchObject({
      errors: [{ message: 'jwt malformed', path: ['updateUser'] }],
      data: null,
    });
    Container.reset(containerId);
  });

  it('should reject updateUser when token is not present', async () => {
    const containerId = uuidv4();

    const updatedUser = {
      username: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const mockedExpressRequest = httpMocks.createRequest();

    const response = await gCallWithRepositoryMock({
      source: updateUserMutation,
      variableValues: {
        id: MOCKED_USER_ID,
        data: updatedUser,
      },
      contextValue: {
        req: mockedExpressRequest,
      },
      repositoryMockedData: {
        methodToMock: userRepositoryMocks.updateUser,
        entityName: User.name,
      },
      containerId,
    });

    expect(response).toMatchObject({
      errors: [{ message: 'token is not present', path: ['updateUser'] }],
      data: null,
    });
    Container.reset(containerId);
  });

  it('should reject updateUser when token has expired', async () => {
    const containerId = uuidv4();

    const updatedUser = {
      username: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const expiredToken = jwt.sign({ id: MOCKED_USER_ID }, ACCESS_TOKEN_SECRET, {
      expiresIn: '-1h',
    });

    const mockedExpressRequest = httpMocks.createRequest({
      headers: {
        authorization: `Bearer ${expiredToken}`,
      },
    });

    const response = await gCallWithRepositoryMock({
      source: updateUserMutation,
      variableValues: {
        id: MOCKED_USER_ID,
        data: updatedUser,
      },
      contextValue: {
        req: mockedExpressRequest,
      },
      repositoryMockedData: {
        methodToMock: userRepositoryMocks.updateUser,
        entityName: User.name,
      },
      containerId,
    });

    expect(response).toMatchObject({
      errors: [{ message: 'token has expired', path: ['updateUser'] }],
      data: null,
    });
    Container.reset(containerId);
  });

  it('should reject updateUser when something goes wrong', async () => {
    const containerId = uuidv4();

    const updatedUser = {
      username: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };

    const jwtStub = sinon.stub(jwt);
    jwtStub.verify.throws(new Error());

    const response = await gCallWithRepositoryMock({
      source: updateUserMutation,
      variableValues: {
        id: MOCKED_USER_ID,
        data: updatedUser,
      },
      contextValue: {
        req: {
          headers: {
            authorization: `Bearer ${faker.datatype.uuid()}`,
          },
        },
      },
      repositoryMockedData: {
        methodToMock: userRepositoryMocks.updateUser,
        entityName: User.name,
      },
      containerId,
    });

    expect(response).toMatchObject({
      errors: [{ message: 'unauthorized', path: ['updateUser'] }],
      data: null,
    });
    Container.reset(containerId);
  });

  it('getUsers', async () => {
    const containerId = uuidv4();

    const getUsersQuery = `
      query ExampleQuery {
        getUsers {
          _id
          avatar
          username
          firstName
          lastName
          email
        }
      }
    `;

    const response = await gCallWithRepositoryMock({
      source: getUsersQuery,
      repositoryMockedData: {
        methodToMock: userRepositoryMocks.getUsers,
        entityName: User.name,
      },
      containerId,
    });

    expect(response).toMatchObject({
      data: {
        getUsers: [...MOCKED_USERS],
      },
    });
    Container.reset(containerId);
  });

  it('getUserById', async () => {
    const containerId = uuidv4();

    const getUserByIdQuery = `
      query GetUserById($id: ID!){
        getUserById(id: $id) {
          _id
          avatar
          username
          firstName
          lastName
          email
        }
      }
    `;

    const response = await gCallWithRepositoryMock({
      source: getUserByIdQuery,
      variableValues: {
        id: MOCKED_USER_ID,
      },
      repositoryMockedData: {
        methodToMock: userRepositoryMocks.getUserById,
        entityName: User.name,
      },
      containerId,
    });

    expect(response).toMatchObject({
      data: {
        getUserById: MOCKED_REGISTERED_USER,
      },
    });
    Container.reset(containerId);
  });
});
