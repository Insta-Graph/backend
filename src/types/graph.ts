import { Repository } from 'typeorm';

export type ExtractFunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]-?: T[P] extends Function ? P : never;
}[keyof T];

export type MockRepositoryMethod = (
  repositoryStub: sinon.SinonStubbedInstance<Repository<object>>
) => void;

export type RepositoryMock<T extends string> = {
  [key in T]: MockRepositoryMethod;
};
