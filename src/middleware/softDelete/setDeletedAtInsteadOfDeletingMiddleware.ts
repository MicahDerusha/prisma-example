import { Prisma } from "@prisma/client";

//hard deleting relationship models is preferred,
//so that we can easily re-create them when needed
const hard_delete_models: Prisma.ModelName[] = [
  // "User",
];

/**
 * on delete / deleteMany
 * changes action to update
 * and sets deletedAt to new Date()
 * @param params
 * @param next
 * @returns
 */
export async function setDeletedAtInsteadOfDeletingMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  //allow some tables to be hard-deleted
  if (params.model && hard_delete_models.includes(params.model)) {
    return next(params);
  }

  // Change action to update and set deletedAt
  if (params.action == "delete") {
    params.action = "update";
    params.args["data"] = { deletedAt: new Date() };
  }
  // Change action to updateMany and set deletedAt
  if (params.action == "deleteMany") {
    // Delete many queries
    params.action = "updateMany";
    if (params.args.data != undefined) {
      params.args.data["deletedAt"] = new Date();
    } else {
      params.args["data"] = { deletedAt: new Date() };
    }
  }
  return next(params);
}
