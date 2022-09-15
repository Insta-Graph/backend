import { Field, ObjectType } from 'type-graphql';
import User from '../../../entity/User';
import TokenData from './TokenData';

@ObjectType()
export default class AuthData {
  @Field(() => User)
  user: User;

  @Field(() => TokenData)
  auth: TokenData;
}
