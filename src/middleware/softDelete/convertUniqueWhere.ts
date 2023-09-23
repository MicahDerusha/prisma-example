import { Prisma } from "@prisma/client";
import { isPrismaModel } from "./addDeletedAtToWhere";

/**
 * must be used before addDeletedAtToWhere
 * converts unique where into non unique
 * @param params
 * @param ID_Key
 * @param Date_Key
 */
export function convertUniqueWhere(params: Prisma.MiddlewareParams) {
  const where = params.args.where;
  if (!where) return;
  const keys = Object.keys(where);
  if (keys.length !== 1) return; //unique queries will only have one key
  const key = keys.at(0) as string;
  if (isPrismaModel(key)) return; //tables are not unique filters and can be skipped
  const value = where[key];
  if (typeof value === "object" && value != null) {
    params.args.where = value;
  }
}
