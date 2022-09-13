// import { ApolloServer } from 'apollo-server-express';

// import { makeExecutableSchema } from '@graphql-tools/schema';

// import logger from 'utils/logger';
// import Schema from './schema';

// const posts = [
//   {
//     id: 2,
//     text: 'Lorem ipsum',
//     user: {
//       avatar: '/uploads/avatar1.png',
//       username: 'Test User',
//     },
//   },
//   {
//     id: 1,
//     text: 'Lorem ipsum',
//     user: {
//       avatar: '/uploads/avatar2.png',
//       username: 'Test User 2',
//     },
//   },
// ];

// const executableSchema = makeExecutableSchema({
//   typeDefs: Schema,
//   resolvers: {
//     RootQuery: {
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       posts(_root, _args, _context) {
//         return posts;
//       },
//     },
//     RootMutation: {
//       // eslint-disable-next-line @typescript-eslint/no-unused-vars
//       addPost(_root, { post, user }, _context) {
//         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//         // @ts-ignore
//         const postObject = {
//           ...post,
//           user,
//           id: posts.length + 1,
//         };
//         posts.push(postObject);
//         logger.log({ level: 'info', message: 'Post was created' });
//         return postObject;
//       },
//     },
//   },
// });

// const server = new ApolloServer({
//   schema: executableSchema,
//   context: ({ req }) => req,
// });

export default 2;
