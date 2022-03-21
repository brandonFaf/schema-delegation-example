import { Field, ID, ObjectType } from '@nestjs/graphql';
import { State } from 'src/state/State.model';

@ObjectType()
export class Country {
  @Field(() => ID)
  code: string;

  @Field()
  name: string;

  @Field()
  startsWithA?: boolean;
  @Field(() => State, { nullable: true })
  primaryState: State;
  @Field(() => [State])
  states: State[];
}
