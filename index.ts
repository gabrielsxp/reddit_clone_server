import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./src/mikro-orm.config";
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { PostResolver } from './src/resolvers/post'
import { UserResolver } from './src/resolvers/user';
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis'
import { __prod__ } from './src/constants';

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient({ host: '127.0.0.1', port: 6379 });

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({
        client: redisClient,
        disableTouch: true
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: 'lax',
        secure: __prod__
      },
      saveUninitialized: false,
      secret: 'g024hg801fnifqiwkfiq4132rfw',
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res })
  });

  apolloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log('Server running on localhost:4000');
  })
};

main().catch((err) => {
  console.error(err)
});
