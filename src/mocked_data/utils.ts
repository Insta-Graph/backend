import { GraphQLSchema, graphql } from 'graphql';
import sinon from 'sinon';
import Container from 'typedi';
import { Repository } from 'typeorm';
import { createSchema } from '../utils/graph';
import { MockRepositoryMethod } from '../types/graph';

export const setupTestingContainer = ({
  methodToMock,
  entityName,
}: {
  methodToMock: MockRepositoryMethod;
  entityName: string;
}): void => {
  const fakeRepository = sinon.createStubInstance(Repository);
  methodToMock(fakeRepository);
  Container.set({ id: `${entityName}_Repository`, value: fakeRepository });
};

interface Options {
  source: string;
  variableValues?: { [key: string]: unknown };
  methodToMock?: string;
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
