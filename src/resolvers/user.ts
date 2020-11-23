import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { MyContext } from "types";
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field(() => String)
  field: string
  @Field(() => String)
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  // register user
  async register (
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext): Promise<UserResponse> {
      const exists = await em.findOne(User, { username: options.username });
      if (exists) {
        return {
          errors: [
            {
              field: 'username',
              message: 'This username already exists'
            }
          ]
        }
      }
      if (options.password.length <= 3) {
        return {
          errors: [
            {
              field: 'password',
              message: 'The password must contain at least 3 characters'
            }
          ]
        }
      }
      if (options.username.length <= 3) {
        return {
          errors: [
            {
              field: 'username',
              message: 'The username must contain at least 3 characters'
            }
          ]
        }
      }
      const hashedPassword = await argon2.hash(options.password);
      const user = await em.create(User, {
        username: options.username,
        password: hashedPassword
      });
      await em.persistAndFlush(user);

      return {user};
  }
  // login a user
  @Mutation(() => UserResponse)
  async login (
    @Arg('options', () => UsernamePasswordInput) options: UsernamePasswordInput,
    @Ctx() { em }: MyContext): Promise<UserResponse> {
      const user = await em.findOne(User, { username: options.username });
      if (!user) {
        return {
          errors: [
            {
              field: 'username',
              message: 'This username doesn\'t exists'
            }
          ]
        }
      }
      const validPassword = await argon2.verify(user.password, options.password);
      console.log('valid: ', validPassword);
      if (!validPassword) {
        return {
          errors: [
            {
              field: 'password',
              message: 'Invalid credentials'
            }
          ]
        }
      }
      return { user };
  }
}
