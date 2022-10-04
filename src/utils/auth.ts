import jwt from 'jsonwebtoken';
import { config } from 'aws-sdk';
import SES from 'aws-sdk/clients/ses';
import {
  ACCESS_TOKEN_SECRET,
  EMAIL_TEMPLATES,
  FRONTEND_URL,
  REFRESH_TOKEN_SECRET,
  SOURCE_EMAIL_ADDRESS,
  TOKEN_EXPIRATION,
  TOKEN_REFRESH_EXPIRATION,
} from '../constants';

export const generateAccessToken = (userId: string) =>
  jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION });

export const generateRefreshToken = (userId: string, tokenVersion: number) =>
  jwt.sign({ id: userId, tokenVersion }, REFRESH_TOKEN_SECRET, {
    expiresIn: TOKEN_REFRESH_EXPIRATION,
  });

export const generateTokens = (userId: string, tokenVersion: number) => ({
  accessToken: generateAccessToken(userId),
  refreshToken: generateRefreshToken(userId, tokenVersion),
  expiresIn: TOKEN_EXPIRATION,
});

config.update({ region: 'us-east-1' });

interface EmailParamsData {
  destinationEmails: string[];
  template: string;
  templateData: string;
}

export const getEmailParamsData = ({
  destinationEmails,
  template,
  templateData,
}: EmailParamsData): SES.SendTemplatedEmailRequest => ({
  Destination: {
    ToAddresses: destinationEmails,
  },
  Source: SOURCE_EMAIL_ADDRESS,
  Template: template,
  TemplateData: templateData,
});

export const sendEmail = async (emailParams: SES.SendTemplatedEmailRequest) => {
  try {
    const response = await new SES({ apiVersion: '2010-12-01' })
      .sendTemplatedEmail(emailParams)
      .promise();
    // eslint-disable-next-line no-console
    console.log(`AWS responded with unique message identifier ${response.MessageId}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    // eslint-disable-next-line no-console
    console.log(`Something went wrong sending the email ${JSON.stringify(error)}`);
  }
};

export const params = {
  Destination: {
    ToAddresses: ['EMAIL_ADDRESS'],
  },
  Source: SOURCE_EMAIL_ADDRESS,
  Template: EMAIL_TEMPLATES.forgotPassword.templateName,
  TemplateData: EMAIL_TEMPLATES.forgotPassword.formatTemplateData(
    `${FRONTEND_URL}/reset-password/token`
  ),
};
