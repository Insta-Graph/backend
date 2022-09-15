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
import { v4 as uuidv4 } from 'uuid';

const registerUserMutation = `
      mutation RegisterUser($data: UserCreateInput!) {
        registerUser(
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

describe('User Resolver', () => {
  it('registerUser', async () => {
    const containerId = uuidv4();

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
    });

    expect(response).toMatchObject({
      data: {
        registerUser: {
          user: { ...MOCKED_REGISTERED_USER },
        },
      },
    });
    expect(response.data?.registerUser).toHaveProperty('auth');
    Container.reset(containerId);
  });

  it('should not create user when already exists', async () => {
    const containerId = uuidv4();

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

    const updateUserMutation = `
      mutation UpdateUser($data: UserUpdateInput!, $id: ID!) {
        updateUser(
          id: $id, options: $data
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
    const updatedUser = {
      username: faker.internet.userName(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
    };
    const response = await gCallWithRepositoryMock({
      source: updateUserMutation,
      variableValues: {
        id: MOCKED_USER_ID,
        data: updatedUser,
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
