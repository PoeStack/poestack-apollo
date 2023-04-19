import { Field, ObjectType } from "type-graphql";

@ObjectType("PoeLeague")
export class GqlPoeLeague {
  @Field()
  id: string;
  @Field()
  realm: string;
  @Field()
  url: string;
  @Field()
  description: string;
}
