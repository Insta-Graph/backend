import { Repository } from 'typeorm';
import { Service, Inject } from 'typedi';
import expressAsyncHandler from 'express-async-handler';
import { TokenExpiredError, JsonWebTokenError, verify } from 'jsonwebtoken';
import { HttpError } from '../types/api';
import { generateAccessToken } from '../utils/auth';
import { REFRESH_TOKEN_SECRET, TOKEN_EXPIRATION } from '../constants';
import User from '../entity/User';

@Service()
export default class RefreshTokenService {
  @Inject(`${User.name}_Repository`)
  private readonly repository: Repository<User>;

  public refreshToken = expressAsyncHandler(async (req, res) => {
    try {
      const refreshToken = req.cookies.pub;

      if (refreshToken) {
        const decoded = verify(refreshToken, REFRESH_TOKEN_SECRET);

        if (typeof decoded === 'string') {
          throw new HttpError(401, 'invalid token');
        }
        const { id, tokenVersion } = decoded;

        const user = await this.repository.findOneBy({ _id: id });

        if (!user) {
          throw new HttpError(401, 'user does not exist');
        }

        if (user.tokenVersion !== tokenVersion) {
          throw new HttpError(401, 'invalid token');
        }

        const accessToken = generateAccessToken(id);
        res.status(200).json({ accessToken, expiresIn: TOKEN_EXPIRATION });
        return;
      }
      throw new HttpError(401, 'token is not present');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);

      if (error instanceof TokenExpiredError) {
        throw new HttpError(401, 'token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new HttpError(400, error.message);
      }
      if (error instanceof HttpError) {
        throw new HttpError(error.status, error.message);
      }

      throw new HttpError(401, 'unauthorized');
    }
  });
}
