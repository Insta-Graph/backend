import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export default class ResponseStatus {
  @Field()
  message: string;

  @Field(() => Boolean)
  success: boolean;
}
