/***********************************/
/* IGNORING SOFT DELETED RECORDS IN UPDATE QUERIES MIDDLEWARE */
/***********************************/

import { Prisma, PrismaClient } from "@prisma/client";
import { addDeletedAtToWhere } from "./addDeletedAtToWhere";
import { convertUniqueWhere } from "./convertUniqueWhere";
import { lowercaseFirstLetter } from "../../utils";

const prisma = new PrismaClient();

/**
 * on update / updateMany
 * adds deletedAt: null to where query
 * recursively applies to nested models
 * maintains return type
 * works for composite unique where queries
 * @param params
 * @param next
 * @returns
 */
export async function ignoreDeletedInUpdateMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (params.action === "update" || params.action === "updateMany") {
    if (!params.model) {
      console.log("missing model in ignoreDeletedInUpdateMiddleware", params);
      throw "missing model";
    }

    //updateMany suports non-unique where
    //so we can simply add the deleted filter
    //and return the result
    if (params.action == "updateMany") {
      addDeletedAtToWhere(params);
      return next(params);
    }

    //update only allows unique where
    //we must change the action to updateMany
    params.action = "updateMany";

    //convert where param to non-unique form
    //must get called before addDeletedAtToWhere
    convertUniqueWhere(params);

    //add deleted filter
    addDeletedAtToWhere(params);

    /**
     * to maintain return type
     * 1. find record before the update (while where is still valid)
     * 2. perform the update
     * 3. return the updated record
     */

    //1. find record before the update (while where is still valid)
    //@ts-ignore
    const before = await prisma[
      lowercaseFirstLetter(params.model)
    ].findFirstOrThrow({
      where: params.args["where"],
    });

    //2. perform the update
    await next(params);

    //3. return the updated record
    //apply the update to the "before" model in memory
    //updatedAt will be off by a few milliseconds
    //but this will save a db read
    //if you need updatedAt to be exact (im not sure why you would ever need this)
    //un-comment the code below (every table must have ID as PK or Unique)
    const after = Object.assign({}, before, params.args.data, {
      updatedAt: new Date(),
    });
    // const after = await prisma[params.model].findFirstOrThrow({
    //   where: { ID },
    // });
    return after;
  }
  return next(params);
}
