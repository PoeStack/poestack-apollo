import { Field, ObjectType } from "type-graphql";
import { GraphQLJSON } from "graphql-scalars";

@ObjectType("PassiveTreeNode")
export class GqlPassiveTreeNode {
  @Field()
  hash: string;

  @Field()
  name: string;

  @Field()
  icon: string;

  @Field({ nullable: true })
  inactiveIcon?: string;

  @Field({ nullable: true })
  activeIcon?: string;

  @Field({ nullable: true })
  activeEffectImage?: string;

  @Field(() => [GraphQLJSON], { nullable: true })
  masteryEffects: any[];

  @Field({ nullable: true })
  isNotable?: boolean;

  @Field({ nullable: true })
  isKeystone?: boolean;

  @Field({ nullable: true })
  isMultipleChoiceOption?: boolean;

  @Field({ nullable: true })
  isMastery?: boolean;

  @Field({ nullable: true })
  isJewelSocket?: boolean;

  @Field({ nullable: true })
  ascendancyName?: string;

  @Field(() => [String])
  stats: string[];

  @Field(() => [String])
  reminderText: string[];

  @Field(() => [String])
  flavourText: string[];

  @Field(() => [String])
  recipe: string[];

  @Field()
  group: number;

  @Field()
  orbit: number;

  @Field()
  orbitIndex: number;

  @Field()
  x: number;

  @Field()
  y: number;

  @Field()
  size: number;

  @Field(() => [String])
  out: string[];

  @Field(() => [String])
  in: string[];
}

@ObjectType("PassiveTreeConnection")
export class GqlPassiveTreeConnection {
  @Field()
  fromNode: string;

  @Field()
  toNode: string;

  @Field()
  curved: boolean;
}

@ObjectType("PassiveTreeConstants")
export class GqlPassiveTreeConstants {
  @Field()
  minX: number;

  @Field()
  minY: number;

  @Field()
  maxX: number;

  @Field()
  maxY: number;

  @Field(() => [Number])
  skillsPerOrbit: number[];

  @Field(() => [Number])
  orbitRadii: number[];
}

@ObjectType("PassiveTreeResponse")
export class GqlPassiveTreeResponse {
  @Field(() => GqlPassiveTreeConstants)
  constants: GqlPassiveTreeConstants;

  @Field(() => GraphQLJSON)
  nodeMap: Record<string, GqlPassiveTreeNode>;

  @Field(() => GraphQLJSON)
  connectionMap: Record<string, GqlPassiveTreeNode[]>;

  @Field(() => [GqlPassiveTreeNode], { nullable: true })
  allNodes?: GqlPassiveTreeNode[];

  @Field(() => [GqlPassiveTreeConnection], { nullable: true })
  allConnections?: GqlPassiveTreeConnection[];
}
