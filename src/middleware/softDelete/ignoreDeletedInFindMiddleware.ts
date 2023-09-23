import { Prisma } from "@prisma/client";
import { addDeletedAtToWhere } from "./addDeletedAtToWhere";
import { convertUniqueWhere } from "./convertUniqueWhere";

/**
 * on findFirst / findFirstOrThrow
 * findUnique / findUniqueOrThrow
 * and findMany
 * adds deletedAt: null to where query
 * recursively applies to nested models
 * maintains throw behavior
 * works for composite unique where queries
 * @param params
 * @param next
 * @returns
 */
export async function ignoreDeletedInFindMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (
    params.action === "findUnique" ||
    params.action === "findFirst" ||
    //@ts-ignore
    params.action === "findFirstOrThrow" ||
    //@ts-ignore
    params.action === "findUniqueOrThrow"
  ) {
    //findUnique and findUniqueOrThrow only allows unique where
    //we must change the action to updateMany
    if (params.action === "findUnique") {
      params.action = "findFirst";
      //convert where param to non-unique form
      //must get called before addDeletedAtToWhere
      convertUniqueWhere(params);
    }
    //@ts-ignore
    else if (params.action === "findUniqueOrThrow") {
      //change to findFirstOrThrow to maintain expected throw behavior
      //@ts-ignore
      params.action = "findFirstOrThrow";
      //convert where param to non-unique form
      //must get called before addDeletedAtToWhere
      convertUniqueWhere(params);
    }

    //add deleted filter
    addDeletedAtToWhere(params);
  }

  //findMany suports non-unique where
  //so we can simply add the deleted filter
  //and return the result
  if (params.action === "findMany") {
    addDeletedAtToWhere(params);
  }
  return next(params);
}
