import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TagsService } from './tags.service';
import { Tag } from './tag.entity';
import { CreateTagInput } from './dto/create-tag.input';
import { UpdateTagInput } from './dto/update-tag.input';

@Resolver(() => Tag)
export class TagsResolver {
  constructor(private tagsService: TagsService) {}

  @Query(() => [Tag])
  tags() {
    return this.tagsService.findAll();
  }

  @Query(() => Tag)
  tag(@Args('id', { type: () => Int }) id: number) {
    return this.tagsService.findOneById(id);
  }

  @Mutation(() => Tag)
  createTag(@Args('input') input: CreateTagInput) {
    return this.tagsService.create(input);
  }

  @Mutation(() => Tag)
  updateTag(@Args('id', { type: () => Int }) id: number, @Args('input') input: UpdateTagInput) {
    return this.tagsService.update(id, input as any);
  }

  @Mutation(() => Boolean)
  deleteTag(@Args('id', { type: () => Int }) id: number) {
    return this.tagsService.remove(id);
  }
}
