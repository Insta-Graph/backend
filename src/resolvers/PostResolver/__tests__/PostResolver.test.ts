import { faker } from '@faker-js/faker';
import sinon from 'sinon';
import Post from 'entity/Post';
import { createEntityMock, gCall } from 'mocked_data/utils';
import { MOCKED_POST, MOCKED_POST_ID, MOCKED_POSTS } from 'mocked_data/post';

describe('Post Resolver', () => {
  const postModel = sinon.createStubInstance(Post);
  const postRepositoryStub = sinon.stub(Post);
  it('createPost', async () => {
    postRepositoryStub.create.returns(postModel);

    const postEntityMock = createEntityMock({
      ...MOCKED_POST,
    });
    // @ts-ignore
    postModel.save.resolves({
      ...postEntityMock,
    });

    const createPostMutation = `
      mutation PostCreate($data: PostCreateInput!) {
        createPost(
          input: $data
        ) {
          _id
          title
          text
        }
      }
    `;
    const response = await gCall({
      source: createPostMutation,
      variableValues: {
        data: { title: MOCKED_POST.title, text: MOCKED_POST.text },
      },
    });

    expect(response).toMatchObject({
      data: {
        createPost: {
          _id: MOCKED_POST._id,
          title: MOCKED_POST.title,
          text: MOCKED_POST.text,
        },
      },
    });
  });

  it('updatePost', async () => {
    const oldPost = {
      ...MOCKED_POST,
    };
    postRepositoryStub.update.resolves();
    postRepositoryStub.findOneByOrFail.resolves(
      createEntityMock({
        ...oldPost,
      })
    );

    const updatePostMutation = `
      mutation PostUpdate($data: PostUpdateInput!, $id: ID!) {
        updatePost(
          id: $id, options: $data
        ) {
          _id
          title
          text
        }
      }
    `;
    const updatedPost = {
      title: faker.random.words(3),
      text: faker.random.words(6),
    };
    const response = await gCall({
      source: updatePostMutation,
      variableValues: {
        id: MOCKED_POST_ID,
        data: updatedPost,
      },
    });

    expect(response).toMatchObject({
      data: {
        updatePost: {
          _id: oldPost._id,
          title: updatedPost.title,
          text: updatedPost.text,
        },
      },
    });
  });

  it('deletePost', async () => {
    postRepositoryStub.delete.resolves();

    const deletePostMutation = `
      mutation PostDelete($id: ID!) {
        deletePost(
          id: $id
        )
      }
    `;

    const response = await gCall({
      source: deletePostMutation,
      variableValues: {
        id: MOCKED_POST_ID,
      },
    });

    expect(response).toMatchObject({
      data: {
        deletePost: true,
      },
    });
  });

  it('getPosts', async () => {
    postRepositoryStub.find.resolves(
      MOCKED_POSTS.map((item) => ({
        ...createEntityMock(item),
      }))
    );

    const getPostsQuery = `
      query ExampleQuery {
        getPosts {
          _id
          title
          text
        }
      }
    `;

    const response = await gCall({
      source: getPostsQuery,
    });

    expect(response).toMatchObject({
      data: {
        getPosts: [...MOCKED_POSTS],
      },
    });
  });

  it('getPostById', async () => {
    postRepositoryStub.findOneByOrFail.resolves(createEntityMock(MOCKED_POST));

    const getPostByIdQuery = `
      query GetPostById($id: ID!){
        getPostById(id: $id) {
          _id
          title
          text
        }
      }
    `;

    const response = await gCall({
      source: getPostByIdQuery,
      variableValues: {
        id: MOCKED_POST_ID,
      },
    });

    expect(response).toMatchObject({
      data: {
        getPostById: MOCKED_POST,
      },
    });
  });
});
