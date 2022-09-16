import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export default class TokenData {
  @Field()
  accessToken: string;

  @Field(() => Int)
  expiresIn: number;
}
