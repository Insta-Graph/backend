import { IsEmail } from 'class-validator';
import { InputType, Field } from 'type-graphql';

@InputType()
export default class ForgotPasswordInput {
  @Field()
  @IsEmail()
  email: string;
}
