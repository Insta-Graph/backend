import { buildSchema, ArgumentValidationError } from 'type-graphql';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { Container } from 'typedi';
import { DataSource } from 'typeorm';
import { ApolloError } from 'apollo-server-express';
import { AuthResolver, PostResolver, UserResolver } from '../resolvers';
import { ENTITIES } from '../constants';

export const formatError = (error: GraphQLError): GraphQLFormattedError => {
  if (error.originalError instanceof ApolloError) {
    return error;
  }

  if (error.originalError instanceof ArgumentValidationError) {
    const { extensions, locations, message, path } = error;

    // eslint-disable-next-line no-param-reassign
    error.extensions.code = 'GRAPHQL_VALIDATION_FAILED';
    // eslint-disable-next-line no-param-reassign
    delete error.extensions.exception.stacktrace;

    return {
      message,
      locations,
      path,
      extensions,
    };
  }

  // eslint-disable-next-line no-param-reassign
  error.message = 'Internal Server Error';

  return error;
};

export const setupContainer = (dataSource: DataSource): void => {
  for (let index = 0; index < ENTITIES.length; index += 1) {
    const entity = ENTITIES[index];
    Container.set({ id: `${entity.name}_Repository`, value: dataSource.getRepository(entity) });
  }
};

export const createSchema = () =>
  buildSchema({
    resolvers: [PostResolver, UserResolver, AuthResolver],
    validate: true,
    container: Container,
  });

// https://github.com/MichalLytek/type-graphql/blob/master/examples/using-container/index.ts
// https://www.youtube.com/watch?v=25GS0MLT8JU
// https://github.com/benawad/jwt-auth-example/blob/master/server/src/entity/User.ts
// https://github.com/typeorm/typeorm/issues/1267
// https://docs.github.com/es/code-security/dependabot/dependabot-version-updates
// https://docs.github.com/es/code-security/dependabot/working-with-dependabot/troubleshooting-dependabot-errors
// https://uis.edu.co/uis-recaudos-es/

// https://stackoverflow.com/questions/67309598/id-like-to-inject-repositories-container-at-service-constructor-using-typedi

// https://github.com/typestack/typedi/issues/45
// https://stackoverflow.com/questions/65233200/jest-tests-please-add-import-reflect-metadata-to-the-top-of-your-entry-poi
// https://github.com/typestack/typedi/blob/develop/docs/typescript/02-basic-usage-guide.md
