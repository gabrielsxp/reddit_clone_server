import { Post } from '../entities/Post';
import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql';
import { MyContext } from '../../types'

@Resolver()
export class PostResolver {
  // return all posts
  @Query(() => [Post])
  posts (@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {})
  }
  // return a post
  @Query(() => Post, { nullable: true })
  post (@Arg('id') id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id })
  }
  // create a post
  @Mutation(() => Post)
  async createPost(@Arg('title') title: string, @Ctx() { em }: MyContext): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }
  // update a post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', { nullable: true }) title: string,
    @Ctx() { em }: MyContext): Promise<Post | null> {
      const post = await em.findOne(Post, { id });
      if (!post) {
        return null;
      }
      if (typeof title !== 'undefined') {
        post.title = title;
      }
      return post
  }
  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext): Promise<boolean> {
    try {
      await em.nativeDelete(Post, { id });
    } catch {
      return false
    }
    return true;
  }
}
