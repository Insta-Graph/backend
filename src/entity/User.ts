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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  avatar: string | null;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column('int', { default: 0 })
  tokenVersion: number;

  @Column({ nullable: true, default: null })
  resetToken: string | null;

  @Column('int', { nullable: true, default: null })
  resetTokenValidity: number | null;
}

export default User;
