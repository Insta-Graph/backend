/* eslint-disable no-console */
import 'reflect-metadata';
import express from 'express';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import compress from 'compression';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import formatError from './utils/error';
import { PostResolver } from './resolvers';
import taskRouter from './routes/tasks';
import authRouter from './routes/auth';
import errorMiddleware from './middleware/error';

async function startMongo() {
  try {
    const connection = new DataSource({
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

    await connection.initialize();
    console.log('MONGO CONNECTED');
  } catch (error) {
    console.log('MONGO ERROR');
    console.log(error);
  }
}

(async () => {
  dotenv.config();

  const app = express();

  startMongo();

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

  app.use(express.json());

  app.use(express.urlencoded({ extended: false }));

  app.use('/api/v1/task', taskRouter);
  app.use('/api/v1/auth', authRouter);

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver],
      validate: true,
    }),
    context: ({ req, res }) => ({ req, res }),
    formatError,
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  const port = 5000;
  app.get('/', (_, res) => {
    res.status(200).send('<h1>Here</h1>');
  });

  app.use(errorMiddleware);

  app.listen(port, () => console.log(`Running on port ${port}`));
})();
