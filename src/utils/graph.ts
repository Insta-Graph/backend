import { buildSchema } from 'type-graphql';
import { graphql, GraphQLSchema } from 'graphql';
import { PostResolver } from 'resolvers';

export const createSchema = () =>
  buildSchema({
    resolvers: [PostResolver],
    validate: true,
  });

interface Options {
  source: string;
  variableValues?: { [key: string]: unknown };
}

let schema: GraphQLSchema;

export const gCall = async ({ source, variableValues }: Options) => {
  if (!schema) {
    schema = await createSchema();
  }
  return graphql({
    schema,
    source,
    variableValues,
  });
};

export const createEntityMock = <T>(args: T) => ({
  ...args,
  hasId: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  softRemove: jest.fn(),
  recover: jest.fn(),
  reload: jest.fn(),
});
