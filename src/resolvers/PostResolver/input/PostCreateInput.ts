import { InputType, Field } from 'type-graphql';

@InputType()
export default class PostCreateInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  text: string;
}
