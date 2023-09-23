import { Prisma } from "@prisma/client";

const prismaModels = Object.keys(Prisma.ModelName);

/**
 * used to figure out when to recurse
 * we need to recurse on keys in the where clause
 * when the key's value is an object,
 * and the key itself is the name of a model.
 * any key itself can contain an object, i.e. where: {Date: {lte: new Date()}}
 * but deletedAt filter should be only added to models
 *
 * @param key key of where clause
 * @returns true if key is the name of a table
 */
export function isPrismaModel(key: string) {
  return prismaModels.includes(key);
}

/**
 * entry point to recursively add deleted filter to where param
 * @param params
 */
export function addDeletedAtToWhere(params: Prisma.MiddlewareParams) {
  //if there is a where clause
  if (params?.args?.where) {
    //add deleted filter recursively
    recursiveAddDeletedAt(params.args.where);
  }
  //no where clause
  else {
    //if no args at all
    if (!params.args) {
      //init args
      params.args = {};
    }
    //add where: { deletedAt: null } to args
    params.args["where"] = { deletedAt: null };
  }
}

export function recursiveAddDeletedAt(where: any) {
  if (!where) return { deletedAt: null };
  if (typeof where === "object" && where != null) {
    const keys = Object.keys(where);
    const containsSome =
      keys.includes("some") || keys.includes("none") || keys.includes("every");

    //recursively check each key of payload, if key is an object
    for (const key of keys) {
      if (!isPrismaModel(key) && !containsSome) continue; //only prisma models have deletedAt
      const value = where[key];
      if (typeof value === "object" && value != null) {
        where[key] = recursiveAddDeletedAt(value);
      }
    }

    if (where.deletedAt == undefined && !containsSome) {
      // Exclude deleted records if they have not been explicitly requested
      where["deletedAt"] = null;
    }
  }
  return where;
}
