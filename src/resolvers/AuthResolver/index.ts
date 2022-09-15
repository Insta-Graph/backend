import { Repository } from 'typeorm';
import { Arg, Mutation, Resolver } from 'type-graphql';
import argon2 from 'argon2';
import { Service, Inject } from 'typedi';
import { generateTokens } from '../../utils/auth';
import User from '../../entity/User';
import { LoginInput } from './input';
import { AuthResponseUnion } from './types';

@Service()
@Resolver()
export default class UserResolver {
  @Inject(`${User.name}_Repository`)
  private readonly repository: Repository<User>;

  @Mutation(() => AuthResponseUnion)
  async login(
    @Arg('input', () => LoginInput) input: LoginInput
  ): Promise<typeof AuthResponseUnion> {
    const user = await this.repository.findOneBy({ email: input.email });

    if (!user) {
      return { success: false, message: 'user does not exist' };
    }
    const isPasswordValid = await argon2.verify(user.password, input.password);

    if (isPasswordValid) {
      const tokenData = generateTokens(user._id.toString());
      return {
        user: { ...user },
        auth: { ...tokenData },
      };
    }

    return { success: false, message: 'password is incorrect' };
  }
}
