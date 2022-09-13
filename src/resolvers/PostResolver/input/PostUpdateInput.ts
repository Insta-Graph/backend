import { Length, MinLength } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
export default class PostUpdateInput {
  @Field({ nullable: true })
  @Length(1, 255)
  title: string;

  @Field({ nullable: true })
  @MinLength(1)
  text: string;
}
