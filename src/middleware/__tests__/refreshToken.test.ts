import jwt from 'jsonwebtoken';
import { NextFunction } from 'express';
import RefreshTokenService from 'middleware/refreshToken';
import sinon from 'sinon';
import { Container } from 'typedi';
import { Repository } from 'typeorm';
import httpMocks from 'node-mocks-http';
import { MOCKED_REGISTERED_USER, MOCKED_USER_ID } from 'mocked_data/user';
import { generateRefreshToken } from 'utils/auth';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandlerUtil } from 'utils/testsUtils';
import { HttpError } from '../../types/api';
import { REFRESH_TOKEN_SECRET, TOKEN_EXPIRATION } from '../../constants/index';

describe('refreshToken', () => {
  it('should refresh token successfully', async () => {
    const containerId = uuidv4();
    const container = Container.of(containerId);
    const fakeRepository = sinon.createStubInstance(Repository);
    fakeRepository.findOneBy.resolves(MOCKED_REGISTERED_USER);

    const next = sinon.stub() as unknown as NextFunction;

    const signedRefreshToken = generateRefreshToken(MOCKED_USER_ID);

    const mockedExpressRequest = httpMocks.createRequest({ cookies: { pub: signedRefreshToken } });
    const mockedExpressResponse = httpMocks.createResponse();

    container.set({ id: `User_Repository`, value: fakeRepository });

    const tokenService = container.get(RefreshTokenService);

    await asyncHandlerUtil(tokenService.refreshToken)(
      mockedExpressRequest,
      mockedExpressResponse,
      next
    );

    expect(mockedExpressResponse._getStatusCode()).toBe(200);
    const jsonResponse = mockedExpressResponse._getJSONData();
    expect(jsonResponse).toBeDefined();
    expect(jsonResponse).toHaveProperty('accessToken');
    expect(jsonResponse).toHaveProperty('expiresIn', TOKEN_EXPIRATION);
    Container.reset(containerId);
  });

  it('should reject when user does not exist', async () => {
    const containerId = uuidv4();
    const container = Container.of(containerId);

    const fakeRepository = sinon.createStubInstance(Repository);
    fakeRepository.findOneBy.resolves(null);

    const next = jest.fn();

    const signedRefreshToken = generateRefreshToken(MOCKED_USER_ID);

    const mockedExpressRequest = httpMocks.createRequest({ cookies: { pub: signedRefreshToken } });
    const mockedExpressResponse = httpMocks.createResponse();

    container.set({ id: `User_Repository`, value: fakeRepository });

    const tokenService = container.get(RefreshTokenService);

    await asyncHandlerUtil(tokenService.refreshToken)(
      mockedExpressRequest,
      mockedExpressResponse,
      next
    );

    expect(next).toBeCalled();
    expect(next).toBeCalledWith(new HttpError(401, 'user does not exist'));
    Container.reset(containerId);
  });

  it('should reject when token is not valid', async () => {
    const containerId = uuidv4();
    const container = Container.of(containerId);

    const fakeRepository = sinon.createStubInstance(Repository);
    fakeRepository.findOneBy.resolves(null);

    const next = jest.fn();

    const mockedExpressRequest = httpMocks.createRequest({
      cookies: { pub: 'MOCKED_REFRESH_TOKEN' },
    });
    const mockedExpressResponse = httpMocks.createResponse();

    container.set({ id: `User_Repository`, value: fakeRepository });

    const tokenService = container.get(RefreshTokenService);

    await asyncHandlerUtil(tokenService.refreshToken)(
      mockedExpressRequest,
      mockedExpressResponse,
      next
    );

    expect(next).toBeCalled();
    expect(next).toBeCalledWith(new HttpError(400, 'jwt malformed'));
    Container.reset(containerId);
  });

  it('should reject when token is not present', async () => {
    const containerId = uuidv4();
    const container = Container.of(containerId);

    const fakeRepository = sinon.createStubInstance(Repository);
    fakeRepository.findOneBy.resolves(null);

    const next = jest.fn();

    const mockedExpressRequest = httpMocks.createRequest();
    const mockedExpressResponse = httpMocks.createResponse();

    container.set({ id: `User_Repository`, value: fakeRepository });

    const tokenService = container.get(RefreshTokenService);

    await asyncHandlerUtil(tokenService.refreshToken)(
      mockedExpressRequest,
      mockedExpressResponse,
      next
    );

    expect(next).toBeCalled();
    expect(next).toBeCalledWith(new HttpError(401, 'token is not present'));
    Container.reset(containerId);
  });

  it('should reject when token has expired', async () => {
    const containerId = uuidv4();
    const container = Container.of(containerId);

    const expiredToken = jwt.sign({ id: MOCKED_USER_ID }, REFRESH_TOKEN_SECRET, {
      expiresIn: '-1h',
    });

    const mockedExpressRequest = httpMocks.createRequest({ cookies: { pub: expiredToken } });
    const mockedExpressResponse = httpMocks.createResponse();

    const fakeRepository = sinon.createStubInstance(Repository);

    const next = jest.fn();

    container.set({ id: `User_Repository`, value: fakeRepository });

    const tokenService = container.get(RefreshTokenService);

    await asyncHandlerUtil(tokenService.refreshToken)(
      mockedExpressRequest,
      mockedExpressResponse,
      next
    );

    expect(next).toBeCalled();
    expect(next).toBeCalledWith(new HttpError(401, 'token has expired'));
    Container.reset(containerId);
  });

  it('should reject when something goes wrong', async () => {
    const containerId = uuidv4();
    const container = Container.of(containerId);

    const jwtStub = sinon.stub(jwt);
    jwtStub.verify.throws(new Error());

    const mockedExpressRequest = httpMocks.createRequest({
      cookies: { pub: 'MOCKED_REFRESH_TOKEN' },
    });
    const mockedExpressResponse = httpMocks.createResponse();

    const fakeRepository = sinon.createStubInstance(Repository);

    const next = jest.fn();

    container.set({ id: `User_Repository`, value: fakeRepository });

    const tokenService = container.get(RefreshTokenService);

    await asyncHandlerUtil(tokenService.refreshToken)(
      mockedExpressRequest,
      mockedExpressResponse,
      next
    );

    expect(next).toBeCalled();
    expect(next).toBeCalledWith(new HttpError(401, 'unauthorized'));
    Container.reset(containerId);
  });
});
