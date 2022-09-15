import { createUnionType } from 'type-graphql';
import ErrorResponse from '../../types/ErrorResponse';
import AuthData from './AuthData';

const AuthResponseUnion = createUnionType({
  name: 'AuthResponse', // the name of the GraphQL union
  // function that returns tuple of object types classes
  types: () => [AuthData, ErrorResponse] as const,
  resolveType: (value) => {
    if ('success' in value) {
      return ErrorResponse; // we can return object type class (the one with `@ObjectType()`)
    }
    if ('user' in value) {
      return AuthData; // or the schema name of the type as a string
    }
    return undefined;
  },
});

export default AuthResponseUnion;
