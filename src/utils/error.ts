import { ApolloError } from 'apollo-server-express';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { ArgumentValidationError } from 'type-graphql';

const formatError = (error: GraphQLError): GraphQLFormattedError => {
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

export default formatError;
