import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export default class ErrorResponse {
  @Field()
  message: string;

  @Field(() => Boolean)
  success: boolean;
}
