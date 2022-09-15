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
import { setupTestingContainer, gCall } from 'mocked_data/utils';
import Container from 'typedi';

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
  beforeEach(() => {
    Container.reset();
  });

  it('registerUser', async () => {
    setupTestingContainer({
      methodToMock: userRepositoryMocks.registerUser,
      entityName: User.name,
    });

    const response = await gCall({
      source: registerUserMutation,
      variableValues: {
        data: { ...MOCKED_REGISTER },
      },
    });

    expect(response).toMatchObject({
      data: {
        registerUser: {
          user: { ...MOCKED_REGISTERED_USER },
        },
      },
    });
    expect(response.data?.registerUser).toHaveProperty('auth');
  });

  it('should not create user when already exists', async () => {
    setupTestingContainer({
      methodToMock: userRepositoryUnsuccessfullyMocks.registerUser,
      entityName: User.name,
    });

    const response = await gCall({
      source: registerUserMutation,
      variableValues: {
        data: { ...MOCKED_REGISTER },
      },
    });

    expect(response).toMatchObject({
      data: {
        registerUser: { success: false, message: 'user already exists' },
      },
    });
  });

  it('updateUser', async () => {
    setupTestingContainer({
      methodToMock: userRepositoryMocks.updateUser,
      entityName: User.name,
    });

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
    const response = await gCall({
      source: updateUserMutation,
      variableValues: {
        id: MOCKED_USER_ID,
        data: updatedUser,
      },
    });

    expect(response).toMatchObject({
      data: {
        updateUser: {
          ...MOCKED_REGISTERED_USER,
          ...updatedUser,
        },
      },
    });
  });

  it('getUsers', async () => {
    setupTestingContainer({
      methodToMock: userRepositoryMocks.getUsers,
      entityName: User.name,
    });

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

    const response = await gCall({
      source: getUsersQuery,
    });

    expect(response).toMatchObject({
      data: {
        getUsers: [...MOCKED_USERS],
      },
    });
  });

  it('getUserById', async () => {
    setupTestingContainer({
      methodToMock: userRepositoryMocks.getUserById,
      entityName: User.name,
    });

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

    const response = await gCall({
      source: getUserByIdQuery,
      variableValues: {
        id: MOCKED_USER_ID,
      },
    });

    expect(response).toMatchObject({
      data: {
        getUserById: MOCKED_REGISTERED_USER,
      },
    });
  });
});
