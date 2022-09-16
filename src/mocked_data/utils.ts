import { graphql, GraphQLSchema } from 'graphql';
import sinon from 'sinon';
import Container, { ContainerInstance } from 'typedi';
import { Repository } from 'typeorm';
import { createSchema } from '../utils/graph';
import { MockRepositoryMethod } from '../types/graph';

interface SetupRepositoryMock {
  methodToMock: MockRepositoryMethod;
  entityName: string;
  container: ContainerInstance;
}

export const setupTestingContainer = ({
  methodToMock,
  entityName,
  container,
}: SetupRepositoryMock): void => {
  const fakeRepository = sinon.createStubInstance(Repository);
  methodToMock(fakeRepository);
  container.set({ id: `${entityName}_Repository`, value: fakeRepository });
};

interface Options {
  source: string;
  variableValues?: { [key: string]: unknown };
  contextValue?: object;
  containerId: string;
  repositoryMockedData: Omit<SetupRepositoryMock, 'container'>;
}

let gCallSchema: GraphQLSchema;

export const gCall = async ({
  source,
  variableValues,
}: Omit<Options, 'containerId' | 'repositoryMockedData'>) => {
  if (!gCallSchema) {
    gCallSchema = await createSchema();
  }
  return graphql({
    schema: gCallSchema,
    source,
    variableValues,
  });
};

export const gCallWithRepositoryMock = async ({
  source,
  variableValues,
  contextValue,
  containerId,
  repositoryMockedData,
}: Options) => {
  const container = Container.of(containerId);

  const schema = await createSchema(container);

  setupTestingContainer({ ...repositoryMockedData, container });

  let result: ReturnType<typeof graphql>;

  if (contextValue) {
    result = graphql({
      schema,
      source,
      variableValues,
      contextValue,
    });
  } else {
    result = graphql({
      schema,
      source,
      variableValues,
    });
  }
  return result;
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
