import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
class User {
  @Field(() => ID)
  @ObjectIdColumn({ generated: false })
  _id: ObjectID;

  @Field()
  @Column()
  username: string;

  @Field()
  @Column()
  firstName: string;

  @Field()
  @Column()
  lastName: string;

  @Field({ nullable: true })
  @Column()
  avatar: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}

export default User;
