import { ObjectID, Repository } from 'typeorm';
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql';
import argon2 from 'argon2';
import { Service, Inject } from 'typedi';
import { v4 as uuidv4 } from 'uuid';
import { EMAIL_TEMPLATES, FRONTEND_URL, TOKEN_RESET_EXPIRATION } from '../../constants';
import { sendEmail, getEmailParamsData, generateTokens } from '../../utils/auth';
import { CustomContext } from '../../types/graph';
import ResponseStatus from '../types/ResponseStatus';
import isAuthenticated from '../../middleware/auth';
import User from '../../entity/User';
import { ChangePasswordInput, ForgotPasswordInput, LoginInput, ResetPasswordInput } from './input';
import { AuthResponseUnion } from './types';

@Service()
@Resolver()
export default class AuthResolver {
  @Inject(`${User.name}_Repository`)
  private readonly repository: Repository<User>;

  @Mutation(() => AuthResponseUnion)
  async login(
    @Arg('input', () => LoginInput) input: LoginInput,
    @Ctx() { res }: CustomContext
  ): Promise<typeof AuthResponseUnion> {
    const user = await this.repository.findOneBy({ email: input.email });

    if (!user) {
      return { success: false, message: 'user does not exist' };
    }
    const isPasswordValid = await argon2.verify(user.password, input.password);

    if (isPasswordValid) {
      const { accessToken, refreshToken, expiresIn } = generateTokens(
        user._id.toString(),
        user.tokenVersion
      );

      res.cookie('pub', refreshToken, { httpOnly: true, path: '/refresh-token' });
      return {
        user: { ...user },
        auth: { accessToken, expiresIn },
      };
    }

    return { success: false, message: 'password is incorrect' };
  }

  @Mutation(() => ResponseStatus)
  @UseMiddleware(isAuthenticated)
  async logout(@Ctx() { res, payload }: CustomContext): Promise<ResponseStatus> {
    const _id = payload?.userId as unknown as ObjectID;

    const user = await this.repository.findOneByOrFail({ _id });

    await this.repository.update({ _id }, { tokenVersion: user.tokenVersion + 1 });

    res.cookie('pub', '', { httpOnly: true, path: '/refresh-token' });

    return { success: true, message: 'successfully logged out' };
  }

  @Mutation(() => ResponseStatus)
  @UseMiddleware(isAuthenticated)
  async changePassword(
    @Ctx() { payload }: CustomContext,
    @Arg('input', () => ChangePasswordInput) { oldPassword, newPassword }: ChangePasswordInput
  ): Promise<ResponseStatus> {
    const _id = payload?.userId as unknown as ObjectID;
    const user = await this.repository.findOneByOrFail({ _id });

    const isPasswordValid = await argon2.verify(user.password, oldPassword);

    if (!isPasswordValid) {
      return { success: false, message: 'your current password is incorrect' };
    }

    const passwordHashed = await argon2.hash(newPassword);

    await this.repository.update({ _id }, { password: passwordHashed });

    return { success: true, message: 'new password set successfully' };
  }

  @Mutation(() => ResponseStatus)
  async forgotPassword(
    @Arg('input', () => ForgotPasswordInput) { email }: ForgotPasswordInput
  ): Promise<ResponseStatus> {
    const user = await this.repository.findOneBy({ email });

    if (user) {
      const resetToken = uuidv4();

      const hashedToken = await argon2.hash(resetToken);

      await this.repository.update(
        { _id: user._id },
        { resetToken: hashedToken, resetTokenValidity: Date.now() + TOKEN_RESET_EXPIRATION * 1000 }
      );

      const emailParams = getEmailParamsData({
        destinationEmails: [user.email],
        template: EMAIL_TEMPLATES.forgotPassword.templateName,
        templateData: EMAIL_TEMPLATES.forgotPassword.formatTemplateData(
          `${FRONTEND_URL}/auth/reset-password/${resetToken}`
        ),
      });
      await sendEmail(emailParams);
    }
    return { success: true, message: 'An email was sent with next steps' };
  }

  @Mutation(() => ResponseStatus)
  async resetPassword(
    @Arg('input', () => ResetPasswordInput) { email, token, password }: ResetPasswordInput
  ): Promise<ResponseStatus> {
    const user = await this.repository.findOneBy({ email });

    if (!user) {
      return { success: false, message: 'User does not exist' };
    }

    const isAuthenticToken = await argon2.verify(user.resetToken ?? '', token);

    const isTokenExpired = Date.now() >= (user.resetTokenValidity ?? 0);

    if (!isAuthenticToken || isTokenExpired) {
      return { success: false, message: 'Invalid verification, please try again.' };
    }

    const hashedToken = await argon2.hash(password);

    user.resetToken = null;
    user.resetTokenValidity = null;
    user.password = hashedToken;

    await this.repository.update(
      { _id: user._id },
      { resetToken: null, resetTokenValidity: null, password: hashedToken }
    );

    return { success: true, message: 'Password successfully changed' };
  }
}
