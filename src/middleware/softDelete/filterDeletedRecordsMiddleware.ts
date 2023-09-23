import { Prisma } from "@prisma/client";

/**
 * on all actions
 * filters deleted records from arrays
 * can request deleted records by defining a value for deletedAt in where
 * maintains return type
 * works recursively
 * @param params
 * @param next
 * @returns
 */
export async function filterDeletedRecordsMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  const result = await next(params);
  if (params?.args?.where) {
    //filter out deleted records if they are not requested
    if (
      params.args.where.deletedAt == null ||
      params.args.where.deletedAt == undefined
    ) {
      return recursiveFilterDeletedRecords(result);
    }
  }
  return result;
}

export function recursiveFilterDeletedRecords(result: any) {
  if (!result) return result;
  if (typeof result === "object" && result != null) {
    //recursively check each key of payload, if key is an object
    const keys = Object.keys(result);
    for (const key of keys) {
      const value = result[key];
      if (typeof value === "object" && value != null) {
        result[key] = recursiveFilterDeletedRecords(value);
      }
    }
    //if input is array
    if (Array.isArray(result)) {
      //return a filtered version
      return result.filter((e) => {
        //if element is object
        if (typeof e === "object" && e != null) {
          //and element is deleted
          if (e.deletedAt instanceof Date) {
            //filter element
            return false;
          }
        }
        return true;
      });
    }
  }
  return result;
}
