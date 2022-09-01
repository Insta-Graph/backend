import { InputType, Field } from 'type-graphql';

@InputType()
export default class PostUpdateInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  text: string;
}
