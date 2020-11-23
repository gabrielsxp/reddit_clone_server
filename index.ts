import 'reflect-metadata';
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./src/mikro-orm.config";
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { PostResolver } from './src/resolvers/post'
import { UserResolver } from './src/resolvers/user';

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver, UserResolver],
      validate: false
    }),
    context: () => ({ em: orm.em })
  })

  apolloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log('Server running on localhost:4000');
  })
};

main().catch((err) => {
  console.error(err)
});
