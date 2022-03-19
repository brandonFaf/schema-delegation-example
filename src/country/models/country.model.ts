import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Country {
  @Field(() => ID)
  code: string;

  @Field()
  name: string;

  @Field()
  startsWithA?: boolean;
}
