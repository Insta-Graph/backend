import { ObjectID, Repository } from 'typeorm';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import argon2 from 'argon2';
import { Service, Inject } from 'typedi';
import { CustomContext } from '../../types/graph';
import ResponseStatus from '../types/ResponseStatus';
import isAuthenticated from '../../middleware/auth';
import { generateTokens } from '../../utils/auth';
import User from '../../entity/User';
import { LoginInput } from './input';
import { AuthResponseUnion } from './types';

@Service()
@Resolver()
export default class AuthResolver {
  @Inject(`${User.name}_Repository`)
  private readonly repository: Repository<User>;

  @Mutation(() => AuthResponseUnion)
  async login(
    @Arg('input', () => LoginInput) input: LoginInput,
    @Ctx() { res }: CustomContext
  ): Promise<typeof AuthResponseUnion> {
    const user = await this.repository.findOneBy({ email: input.email });

    if (!user) {
      return { success: false, message: 'user does not exist' };
    }
    const isPasswordValid = await argon2.verify(user.password, input.password);

    if (isPasswordValid) {
      const { accessToken, refreshToken, expiresIn } = generateTokens(
        user._id.toString(),
        user.tokenVersion
      );

      res.cookie('pub', refreshToken, { httpOnly: true, path: '/refresh-token' });
      return {
        user: { ...user },
        auth: { accessToken, expiresIn },
      };
    }

    return { success: false, message: 'password is incorrect' };
  }

  @Mutation(() => ResponseStatus)
  @UseMiddleware(isAuthenticated)
  async logout(@Ctx() { res, payload }: CustomContext): Promise<ResponseStatus> {
    const _id = (payload?.userId ?? '') as unknown as ObjectID;

    await this.repository.increment({ _id }, 'tokenVersion', 1);

    res.cookie('pub', '', { httpOnly: true, path: '/refresh-token' });

    return { success: true, message: 'successfully logged out' };
  }
}
