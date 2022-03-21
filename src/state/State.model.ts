import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class State {
  @Field(() => ID)
  code: string;

  @Field()
  name: string;

  @Field()
  isPrimaryState: boolean;
}
