import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { TagsService } from './tags.service';
import { Tag } from './tag.entity';
import { CreateTagInput } from './dto/create-tag.input';

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
}
