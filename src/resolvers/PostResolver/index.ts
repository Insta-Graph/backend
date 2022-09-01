import { ObjectID } from 'typeorm';
import { Arg, ID, Mutation, Query, Resolver } from 'type-graphql';
import { v4 as uuidv4 } from 'uuid';
import Post from '../../entity/Post';
import { PostCreateInput, PostUpdateInput } from './input';

@Resolver()
export default class PostResolver {
  @Mutation(() => Post)
  async createPost(@Arg('input', () => PostCreateInput) input: PostCreateInput) {
    const id = uuidv4();
    // eslint-disable-next-line no-console
    console.log(id);
    const newPost = await Post.create({ _id: id, text: input.text, title: input.title }).save();
    return newPost;
  }

  @Mutation(() => Post)
  async updatePost(
    @Arg('id', () => ID) id: ObjectID,
    @Arg('options', () => PostUpdateInput) options: PostUpdateInput
  ) {
    const oldPost = await Post.findOneByOrFail({ _id: id });
    await Post.update({ _id: id }, options);
    return { ...oldPost, ...options };
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id', () => ID) id: ObjectID) {
    await Post.delete({ _id: id });
    return true;
  }

  @Query(() => Post)
  async getPostById(@Arg('id', () => ID) id: ObjectID) {
    const newPost = await Post.findOneByOrFail({ _id: id });
    return newPost;
  }

  @Query(() => [Post])
  async getPosts() {
    const posts = await Post.find();
    return posts;
  }
}
