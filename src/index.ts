import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { PostResolver } from './resolvers/post'

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [PostResolver],
      validate: false
    })
  })

  apolloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log('Server running on localhost:4000');
  })
};

main().catch((err) => {
  console.error(err)
});
