import { IsEmail, Length } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
export default class UserUpdateInput {
  @Field({ nullable: true })
  @Length(1, 255)
  firstName: string;

  @Field({ nullable: true })
  @Length(1, 255)
  lastName: string;

  @Field({ nullable: true })
  @Length(1, 255)
  username: string;

  @Field({ nullable: true })
  @Length(1, 255)
  avatar: string;

  @Field({ nullable: true })
  @IsEmail()
  email: string;
}
