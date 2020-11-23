import { Query, Resolver } from 'type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => String)
  post () {
    return "post";
  }
}
