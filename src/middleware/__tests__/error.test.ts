import httpMocks from 'node-mocks-http';
import errorMiddleware from 'middleware/error';
import { HttpError } from '../../types/api';

describe('errorMiddleware', () => {
  it('should respond with error object', () => {
    const mockedExpressRequest = httpMocks.createRequest();
    const mockedExpressResponse = httpMocks.createResponse();
    const error = new HttpError(400, 'MOCKED_ERROR');
    const next = jest.fn();
    errorMiddleware(error, mockedExpressRequest, mockedExpressResponse, next);

    expect(mockedExpressResponse._getStatusCode()).toBe(400);
    expect(mockedExpressResponse._getJSONData()).toStrictEqual({
      status: 400,
      message: 'MOCKED_ERROR',
      stack: error.stack,
    });
  });

  it('should respond with 500 status', () => {
    const mockedExpressRequest = httpMocks.createRequest();
    const mockedExpressResponse = httpMocks.createResponse();
    const error = new Error();
    const next = jest.fn();
    // @ts-ignore
    errorMiddleware(error, mockedExpressRequest, mockedExpressResponse, next);

    expect(mockedExpressResponse._getStatusCode()).toBe(500);
    expect(mockedExpressResponse._getJSONData()).toStrictEqual({
      status: 500,
      message: 'Something went wrong',
      stack: error.stack,
    });
  });
});
