import { ApolloError } from 'apollo-server-express';
import { GraphQLError } from 'graphql';
import sinon from 'sinon';
import { ArgumentValidationError } from 'type-graphql';
import Container from 'typedi';
import { DataSource } from 'typeorm';
import { ENTITIES } from '../../constants';
import { formatError, setupContainer } from '../graph';

describe('formatError util', () => {
  it('should return the same error when it is from Apollo', () => {
    const error = new ApolloError('MOCKED_MESSAGE', 'APOLLO_MOCKED_CODE', {});

    const graphError = new GraphQLError(
      'MOCKED_MESSAGE',
      undefined,
      undefined,
      undefined,
      undefined,
      error
    );
    const result = formatError(graphError);
    expect(result).toBe(graphError);
  });

  it('should return error without stacktrace and a different extensions code', () => {
    const validationError = { property: 'MOCK' };
    const error = new ArgumentValidationError([validationError]);

    const graphError = new GraphQLError(
      'MOCKED_MESSAGE',
      undefined,
      undefined,
      undefined,
      undefined,
      error,
      { code: 'MOCKED_ERROR_CODE', exception: { code: 'CODE', stacktrace: ['MOCK_STACK_TRACE'] } }
    );
    const result = formatError(graphError);
    expect(result).toMatchObject({
      message: 'MOCKED_MESSAGE',
      extensions: {
        code: 'GRAPHQL_VALIDATION_FAILED',
        exception: { code: 'CODE' },
      },
      locations: undefined,
      path: undefined,
    });
  });

  it('should return the same error with different message', () => {
    const error = new Error('ERROR');

    const graphError = new GraphQLError(
      'MOCKED_MESSAGE',
      undefined,
      undefined,
      undefined,
      undefined,
      error
    );
    const result = formatError(graphError);
    expect(result).toMatchObject({
      message: 'Internal Server Error',
    });
  });
});

describe('setupContainer util', () => {
  it('should setup all database repositories', () => {
    const dataSourceStub = sinon.createStubInstance(DataSource);
    // @ts-ignore
    dataSourceStub.getRepository.returns();

    setupContainer(dataSourceStub);

    for (let index = 0; index < ENTITIES.length; index += 1) {
      const entity = ENTITIES[index];
      const result = Container.has(`${entity.name}_Repository`);
      expect(result).toBeTruthy();
    }
  });
});
