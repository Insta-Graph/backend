/* eslint-disable no-console */
import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compress from 'compression';
import { ApolloServer } from 'apollo-server-express';
import { DataSource } from 'typeorm';
import cookieParser from 'cookie-parser';
import Container from 'typedi';
import RefreshTokenService from './middleware/refreshToken';
import errorMiddleware from './middleware/error';
import { createSchema, setupContainer, formatError } from './utils/graph';

const AppDataSource = new DataSource({
  type: 'mongodb',
  url: `mongodb://${process.env.DB_USER ?? 'admin'}:${
    process.env.DB_PASSWORD ?? 'password'
  }@db:27017/todo?authSource=admin`,
  useNewUrlParser: true,
  synchronize: true,
  logging: true,
  entities: ['src/entity/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
  migrations: ['src/migration/**/*.ts'],
});

const connectToDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('MongoDB Connected');
  } catch (error) {
    console.log('MongoDB Connection Error');
    console.log(error);
    console.log(JSON.stringify(error));
  }
};

(async () => {
  dotenv.config();

  const app = express();

  setupContainer(AppDataSource);

  await connectToDatabase();

  app.use(compress());

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', '*.amazonaws.com'],
        },
      })
    );
    app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
  }

  app.use(cors());

  app.use(cookieParser());

  app.use(express.json());

  app.use(express.urlencoded({ extended: false }));

  const apolloServer = new ApolloServer({
    schema: await createSchema(),
    context: ({ req, res }) => ({ req, res }),
    formatError,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  const port = 5000;

  app.post('/refresh-token', Container.get(RefreshTokenService).refreshToken);

  app.get('/', (_, res) => {
    res.status(200).send('<h1>Here</h1>');
  });

  app.use(errorMiddleware);

  app.listen(port, () => console.log(`Running on port ${port}`));
})();
