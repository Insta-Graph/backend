import { IsEmail, Length, Matches } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
export default class UserCreateInput {
  @Field()
  @Length(1, 255)
  firstName: string;

  @Field()
  @Length(1, 255)
  lastName: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @Length(8, 255)
  @Matches(/[0-9]/, { message: 'Must have at least one digit' })
  @Matches(/[a-zA-Z]/, { message: 'Must have at least one lowercase and uppercase letter' })
  @Matches(/[!#@$%^&*)(+=._-]/, {
    message: 'Must have at least one special character: !#@$%^&*)(+=._-',
  })
  password: string;
}
