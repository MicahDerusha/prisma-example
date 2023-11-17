import { Prisma, PrismaClient, AuditAction } from "@prisma/client";
import {
  ExcludeUnionKeys,
  IncludeUnionKeys,
  LowercaseFirstCharacter,
  excludeObjectKeys,
} from "../types";
import { lowercaseFirstLetter } from "../utils";

const prisma = new PrismaClient();

//add table names that dont have an audit table here
const TablesWithoutAudit: DataModelNames[] = [
  // "Hear_About_Us",
];

export type DataModelNames = ExcludeUnionKeys<Prisma.ModelName, "_Audit">;
export type AuditModelNames = IncludeUnionKeys<Prisma.ModelName, "_Audit">;
export type AuditTable = LowercaseFirstCharacter<AuditModelNames>;
export type ModelTable = LowercaseFirstCharacter<DataModelNames>;

const DataModelsObject = excludeObjectKeys(Prisma.ModelName, "_Audit");
const DataModels = Object.keys(DataModelsObject) as DataModelNames[];

export const auditMapping = new Map<DataModelNames, AuditTable>(
  DataModels.map((tableName) => {
    return [tableName, lowercaseFirstLetter(tableName) + "_Audit"] as [
      DataModelNames,
      AuditTable
    ];
  })
);

export const tableMapping = new Map<DataModelNames, ModelTable>(
  DataModels.map((tableName) => {
    return [tableName, lowercaseFirstLetter(tableName)] as [
      DataModelNames,
      ModelTable
    ];
  })
);
/***********************************/
/* CREATE AUDIT TABLE ENTRY MIDDLEWARE */
/***********************************/
export async function createAuditLog(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (
    params.action == "executeRaw" ||
    params.action == "runCommandRaw" ||
    params.action == "createMany"
  ) {
    throw `Can't create audit for raw queries or createMany`;
  }

  const { model } = params;

  if (!model) {
    return next(params);
  }

  //only create audits for these actions
  if (
    params.action !== "create" &&
    params.action !== "delete" &&
    params.action !== "deleteMany" &&
    params.action !== "update" &&
    params.action !== "updateMany" &&
    params.action !== "upsert"
  ) {
    return next(params);
  }

  if (model.includes("_Audit")) {
    throw "cant create audit directly";
  }

  //skip tables that dont have an audit table
  if (TablesWithoutAudit.includes(model as DataModelNames)) {
    return next(params);
  }

  //only create audits for these tables
  const auditTableName = auditMapping.get(model as DataModelNames);
  const modelTableName = tableMapping.get(model as DataModelNames); //used on delete and update many

  if (!auditTableName || !modelTableName) {
    console.log(`error: missisng audit or model table for ${model}`);
    return next(params);
  }

  const auditTable = prisma[auditTableName] as any;
  const modelTable = prisma[modelTableName] as any;

  if (params.action == "create") {
    const result = await next(params);
    const Action: AuditAction = "CREATE";
    await auditTable.create({
      data: removeNullsRecursive({ ...result, Action }),
    });
    return result;
  }
  if (params.action == "update") {
    const result = await next(params);
    const Action: AuditAction = "UPDATE";
    await auditTable.create({
      data: removeNullsRecursive({ ...result, Action }),
    });
    return result;
  }
  if (params.action == "upsert") {
    const result = await next(params);
    const Action: AuditAction = "UPSERT";
    await auditTable.create({
      data: removeNullsRecursive({ ...result, Action }),
    });
    return result;
  }
  if (params.action == "delete") {
    const where = params.args.where;
    const Action: AuditAction = "DELETE";
    const deletedRecord = await modelTable.findUnique({
      where,
    });
    const result = await next(params);
    if (deletedRecord)
      await auditTable.create({
        data: removeNullsRecursive({ ...deletedRecord, Action }),
      });
    return result;
  }
  if (params.action == "deleteMany") {
    const where = params.args.where;
    const Action: AuditAction = "DELETE";

    const deletedRecords = await modelTable.findMany({
      where,
    });
    const result = await next(params);
    for (const deletedRecord of deletedRecords) {
      await auditTable.create({
        data: removeNullsRecursive({ ...deletedRecord, Action }),
      });
    }
    return result;
  }
  if (params.action == "updateMany") {
    const where = params.args.where;
    const Action: AuditAction = "UPDATE";

    //data in the where clause could be updated
    //so we must find the records before the update
    //and apply the update manually
    const staleRecords: any[] = await modelTable.findMany({
      where,
    });
    const result = await next(params);
    for (const staleRecord of staleRecords) {
      await auditTable.create({
        data: removeNullsRecursive(
          Object.assign(
            { ...staleRecord, Action, updatedAt: new Date() },
            params.args.data
          )
        ),
      });
    }
    return result;
  }
  return next(params);
}

//you can not insert null. switch nulls to undefined
//takes an input object and returns an output object that where all the nulls are replaced with undefined
function removeNullsRecursive(obj: any) {
  if (typeof obj === "object" && obj != null) {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === "object" && val != null) {
        obj[key] = removeNullsRecursive(val);
      }
      if (typeof val === "object" && val === null) {
        obj[key] = undefined;
      }
    }
  }
  return obj;
}
