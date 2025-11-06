import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { LoginUserInput } from './dto/login-user.input';
import { UpdateUserInput } from './dto/update-user.input';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Query(() => [User])
  users() {
    return this.usersService.findAll();
  }

  @Query(() => User)
  user(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOneById(id);
  }

  @Mutation(() => User)
  createUser(@Args('input') input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => User)
  updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUserInput,
  ) {
    return this.usersService.update(id, input);
  }

  // Ejemplo simple de login; aquí podrías devolver un JWT
  @Mutation(() => User, { nullable: true })
  async login(@Args('input') input: LoginUserInput) {
    const user = await this.usersService.validateUser(input.email, input.password);
    if (!user) return null;
    // en lugar de retornar null, suele devolverse un token JWT
    return user;
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }
}
