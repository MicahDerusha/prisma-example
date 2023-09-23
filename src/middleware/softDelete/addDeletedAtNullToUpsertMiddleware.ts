import { Prisma } from "@prisma/client";

/**
 * on upsert
 * adds deletedAt: null to update data
 * this ensures that after calling upsert
 * the resulting record is not deleted
 * note: not recursive and does not apply to nested models
 * @param params
 * @param next
 * @returns
 */
export async function addDeletedAtNullToUpsertMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (params.action == "upsert") {
    if (params?.args?.create) {
      recursiveaddDeletedAtNullToUpsert(params.args.create);
    }
    if (params?.args?.update) {
      recursiveaddDeletedAtNullToUpsert(params.args.update);
    }
  }
  return next(params);
}

export function recursiveaddDeletedAtNullToUpsert(update: any) {
  if (!update) return update;
  if (typeof update === "object" && update != null) {
    //recursively check each key of payload, if key is an object
    // const keys = Object.keys(update);
    // for (const key of keys) {
    //   const value = update[key];
    //   if (typeof value === "object" && value != null) {
    //     update[key] = recursiveaddDeletedAtNullToUpsert(value);
    //   }
    // }
    //if deletedAt is not specified
    if (update.deletedAt == undefined) {
      //restore deleted records
      update.deletedAt = null;
    }
  }
  return update;
}
