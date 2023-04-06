/* eslint-disable @typescript-eslint/no-namespace */

import { PrismaClient } from "@prisma/client";
import { singleton } from "tsyringe";
import { type GqlStashLocation } from "../../models/basic-models";
import _ from "lodash";

declare global {
  namespace PrismaJson {
    type JStashLocation = GqlStashLocation[];
  }
}

@singleton()
export default class PostgresService {
  prisma: PrismaClient = new PrismaClient({
    log: ["warn", "error"],
  });
}
