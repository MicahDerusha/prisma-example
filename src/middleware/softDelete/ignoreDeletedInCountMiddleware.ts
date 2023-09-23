import { Prisma } from "@prisma/client";
import { addDeletedAtToWhere } from "./addDeletedAtToWhere";

/**
 * on count
 * adds deletedAt: null to where query
 * recursively applies to nested models
 * @param params
 * @param next
 * @returns
 */
export async function ignoreDeletedInCountMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  //count suports non-unique where
  //so we can simply add the deleted filter
  //and return the result
  if (
    //@ts-ignore
    params.action === "count"
  ) {
    addDeletedAtToWhere(params);
  }
  return next(params);
}
