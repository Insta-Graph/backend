import { ObjectID, Repository } from 'typeorm';
import { Arg, Ctx, ID, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import { Service, Inject } from 'typedi';
import { CustomContext } from '../../types/graph';
import isAuthenticated from '../../middleware/auth';
import { AuthResponseUnion } from '../AuthResolver/types';
import { generateTokens } from '../../utils/auth';
import User from '../../entity/User';
import { UserCreateInput, UserUpdateInput } from './input';

@Service()
@Resolver()
export default class UserResolver {
  @Inject(`${User.name}_Repository`)
  readonly repository: Repository<User>;

  @Mutation(() => AuthResponseUnion)
  async registerUser(
    @Arg('input', () => UserCreateInput) input: UserCreateInput,
    @Ctx() { res }: CustomContext
  ): Promise<typeof AuthResponseUnion> {
    const user = await this.repository.findOneBy({ email: input.email });

    if (user) {
      return { success: false, message: 'user already exists' };
    }

    const id = uuidv4();
    const { firstName, lastName, email, password } = input;

    const hashedPassword = await argon2.hash(password);
    const newUser = this.repository.create({
      _id: id,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      username: `${firstName} ${lastName}`,
    });

    await this.repository.save(newUser);
    const { accessToken, refreshToken, expiresIn } = generateTokens(newUser._id.toString());
    res.cookie('pub', refreshToken, { httpOnly: true });
    return {
      user: { ...newUser },
      auth: { accessToken, expiresIn },
    };
  }

  @Mutation(() => User)
  @UseMiddleware(isAuthenticated)
  async updateUser(
    @Arg('options', () => UserUpdateInput) options: UserUpdateInput,
    @Ctx() { payload }: CustomContext
  ) {
    const _id = (payload?.userId ?? '') as unknown as ObjectID;

    const oldUser = await this.repository.findOneByOrFail({ _id });
    await this.repository.update({ _id }, options);
    return { ...oldUser, ...options };
  }

  @Query(() => User)
  async getUserById(@Arg('id', () => ID) id: ObjectID) {
    const newUser = await this.repository.findOneByOrFail({ _id: id });
    return newUser;
  }

  @Query(() => [User])
  async getUsers() {
    const users = await this.repository.find();
    return users;
  }
}
