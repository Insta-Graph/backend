import { Entity, ObjectID, ObjectIdColumn, Column, BaseEntity } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export default class Post extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn({ generated: false })
  _id: ObjectID;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column()
  text: string;
}
