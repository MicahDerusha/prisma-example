import { Prisma } from "@prisma/client";
import { addDeletedAtToWhere } from "./addDeletedAtToWhere";

/**
 * on aggregate
 * adds deletedAt: null to where query
 * recursively applies to nested models
 * @param params
 * @param next
 * @returns
 */
export async function ignoreDeletedInAggregateMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  //aggregate suports non-unique where
  //so we can simply add the deleted filter
  //and return the result
  if (params.action === "aggregate") {
    addDeletedAtToWhere(params);
  }
  return next(params);
}
