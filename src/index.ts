import { Prisma, PrismaClient } from "@prisma/client";
import { addDeletedAtNullToUpsertMiddleware } from "./middleware/softDelete/addDeletedAtNullToUpsertMiddleware";
import { filterDeletedRecordsMiddleware } from "./middleware/softDelete/filterDeletedRecordsMiddleware";
import { setDeletedAtInsteadOfDeletingMiddleware } from "./middleware/softDelete/setDeletedAtInsteadOfDeletingMiddleware";
import { ignoreDeletedInUpdateMiddleware } from "./middleware/softDelete/ignoreDeletedInUpdateMiddleware";
import { ignoreDeletedInFindMiddleware } from "./middleware/softDelete/ignoreDeletedInFindMiddleware";
import { ignoreDeletedInAggregateMiddleware } from "./middleware/softDelete/ignoreDeletedInAggregateMiddleware";
import { ignoreDeletedInCountMiddleware } from "./middleware/softDelete/ignoreDeletedInCountMiddleware";
import { ignoreDeletedInGroupByMiddleware } from "./middleware/softDelete/ignoreDeletedInGroupByMiddleware";
import { createAuditLog } from "./middleware/audit";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
//   global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "local"
        ? ["error", "warn"] //["query", "info", "warn", "error"],
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

///////// soft delete middlewares need to be first /////////
prisma.$use(setDeletedAtInsteadOfDeletingMiddleware); //this should be first soft-delete middleware
prisma.$use(ignoreDeletedInFindMiddleware);
prisma.$use(ignoreDeletedInUpdateMiddleware);

//DO NOT IGNORE DELETED RECORDS ON UPSERT
//otherwise, calling upsert on a deleted record with a unique key will fail
//as the existing deleted record will be ignored by the upsert
//and then the create will fail due to unique constraint

prisma.$use(ignoreDeletedInAggregateMiddleware);
prisma.$use(ignoreDeletedInCountMiddleware);
prisma.$use(ignoreDeletedInGroupByMiddleware);
prisma.$use(addDeletedAtNullToUpsertMiddleware);
prisma.$use(filterDeletedRecordsMiddleware); //this should be last soft-delete middleware
///////// end of soft delete middlewares /////////

///////// audit needs to be last /////////
prisma.$use(createAuditLog);

export const prismaHardDelete = new PrismaClient({
  log:
    process.env.NODE_ENV === "local"
      ? ["error", "warn"] //["query", "info", "warn", "error"],
      : ["error"],
});
prismaHardDelete.$use(createAuditLog);
