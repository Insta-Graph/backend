import { Length, MinLength, IsUUID } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
export default class PostCreateInput {
  @Field()
  @Length(1, 255)
  title: string;

  @Field({ nullable: true })
  @MinLength(1)
  text: string;

  @Field()
  @IsUUID()
  userId: string;
}
