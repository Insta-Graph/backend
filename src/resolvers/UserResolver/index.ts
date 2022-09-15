import { ObjectID, Repository } from 'typeorm';
import { Arg, ID, Mutation, Query, Resolver } from 'type-graphql';
import { v4 as uuidv4 } from 'uuid';
import argon2 from 'argon2';
import { Service, Inject } from 'typedi';
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
    @Arg('input', () => UserCreateInput) input: UserCreateInput
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
    const tokenData = generateTokens(newUser._id.toString());
    return {
      user: { ...newUser },
      auth: { ...tokenData },
    };
  }

  @Mutation(() => User)
  async updateUser(
    @Arg('id', () => ID) id: ObjectID,
    @Arg('options', () => UserUpdateInput) options: UserUpdateInput
  ) {
    const oldUser = await this.repository.findOneByOrFail({ _id: id });
    await this.repository.update({ _id: id }, options);
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
