import { buildSchema, ArgumentValidationError } from 'type-graphql';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { Container, ContainerInstance } from 'typedi';
import { DataSource } from 'typeorm';
import { ApolloError } from 'apollo-server-express';
import { HttpError } from '../types/api';
import { AuthResolver, PostResolver, UserResolver } from '../resolvers';
import { ENTITIES } from '../constants';

export const formatError = (error: GraphQLError): GraphQLFormattedError => {
  // eslint-disable-next-line no-param-reassign
  delete error.extensions?.exception?.stacktrace;

  if (error.originalError instanceof ApolloError) {
    return error;
  }

  if (error.originalError instanceof ArgumentValidationError) {
    const { extensions, locations, message, path } = error;

    // eslint-disable-next-line no-param-reassign
    error.extensions.code = 'GRAPHQL_VALIDATION_FAILED';

    return {
      message,
      locations,
      path,
      extensions,
    };
  }

  if (!(error.originalError instanceof HttpError)) {
    // eslint-disable-next-line no-param-reassign
    error.message = 'Internal Server Error';
  }

  return error;
};

export const setupContainer = (dataSource: DataSource): void => {
  for (let index = 0; index < ENTITIES.length; index += 1) {
    const entity = ENTITIES[index];
    Container.set({ id: `${entity.name}_Repository`, value: dataSource.getRepository(entity) });
  }
};

export const createSchema = (containerInstance?: ContainerInstance) =>
  buildSchema({
    resolvers: [PostResolver, UserResolver, AuthResolver],
    validate: true,
    container: containerInstance ?? Container,
  });
