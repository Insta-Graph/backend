/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { graphqlHTTP } from 'express-graphql';
import serverlessExpress from '@vendia/serverless-express';
import cookieParser from 'cookie-parser';
import Container from 'typedi';
import { APIGatewayEvent, Context } from 'aws-lambda';
import Post from 'entity/Post';
import User from 'entity/User';
import cors from 'cors';
import { CORS_WHITELIST } from './constants';
import RefreshTokenService from './middleware/refreshToken';
import errorMiddleware from './middleware/error';
import { createSchemaSync, setupContainer } from './utils/graph';

(<any>global).cachedSchema = (<any>global).cachedSchema || createSchemaSync();

(<any>global).cachedDataSource =
  (<any>global).cachedDataSource ||
  new DataSource({
    type: 'mongodb',
    url: `mongodb+srv://${process.env.DB_USERNAME ?? ''}:${process.env.DB_PASSWORD ?? ''}@${
      process.env.DB_CLUSTER_URL ?? ''
    }`,
    useNewUrlParser: true,
    synchronize: true,
    logging: true,
    ssl: true,
    entities: [Post, User],
    subscribers: ['src/subscriber/**/*.{js,ts}'],
  });

const schema = (<any>global).cachedSchema;
const AppDataSource = (<any>global).cachedDataSource as DataSource;

const connectToDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('MongoDB Connected');
    } else {
      console.log('Reusing MongoDB connection');
    }
  } catch (error) {
    console.log('MongoDB Connection Error');
    console.log(error);
    console.log(JSON.stringify(error));
  }
};

export const app = express();

let serverlessExpressInstance: ReturnType<typeof serverlessExpress>;

function bootstrapServer(event: APIGatewayEvent, context: Context) {
  dotenv.config();

  setupContainer(AppDataSource);

  app.use(
    cors({
      origin(origin, callback) {
        if (CORS_WHITELIST.indexOf(origin ?? '') !== -1 || !origin) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );

  app.use(cookieParser());

  app.use(express.json());

  app.use(express.urlencoded({ extended: false }));

  app.post('/refresh-token', Container.get(RefreshTokenService).refreshToken);

  app.use(
    '/graphql',
    graphqlHTTP(async (req, res, graphQLParams) => ({
      schema,
      context: { req, res, graphQLParams },
      graphiql: false,
    }))
  );

  app.get('/', (_, res) => {
    res.status(200).send('<h1>Here</h1>');
  });

  app.use(errorMiddleware);

  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context, () => {
    console.log('here');
  });
}

export const graphqlHandler = async (event: APIGatewayEvent, context: Context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  console.log(process.env.FRONTEND_URL);

  await connectToDatabase();

  if (serverlessExpressInstance) {
    console.log('Using cached server...');
    return serverlessExpressInstance(event, context, () => {
      console.log('here');
    });
  }
  console.log('Bootstrapping server...');
  return bootstrapServer(event, context);
};
