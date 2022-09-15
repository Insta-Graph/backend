import { Length, Matches } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
export default class ChangePasswordInput {
  @Field()
  @Length(8, 255)
  @Matches(/[0-9]/, { message: 'Must have at least one digit' })
  @Matches(/[a-zA-Z]/, { message: 'Must have at least one lowercase and uppercase letter' })
  @Matches(/[!#@$%^&*)(+=._-]/, {
    message: 'Must have at least one special character: !#@$%^&*)(+=._-',
  })
  newPassword: string;

  @Field()
  @Length(8, 255)
  @Matches(/[0-9]/, { message: 'Must have at least one digit' })
  @Matches(/[a-zA-Z]/, { message: 'Must have at least one lowercase and uppercase letter' })
  @Matches(/[!#@$%^&*)(+=._-]/, {
    message: 'Must have at least one special character: !#@$%^&*)(+=._-',
  })
  oldPassword: string;
}
