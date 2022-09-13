import { Entity, ObjectID, ObjectIdColumn, Column, BaseEntity } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export default class User extends BaseEntity {
  @Field(() => ID)
  @ObjectIdColumn({ generated: false })
  _id: ObjectID;

  @Field()
  @Column()
  username: string;

  @Field({ nullable: true })
  @Column()
  avatar: string;
}
