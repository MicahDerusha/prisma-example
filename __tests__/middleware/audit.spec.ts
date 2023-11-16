import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { PrismaClient, Prisma, AuditAction, User_Audit } from "@prisma/client";
import { createAuditLog } from "../../../prisma/middleware/audit";
import test_company_a from "../../../prisma/seed/Companies/test_company_a";

const prisma = new PrismaClient();
prisma.$use(createAuditLog);
const prismaHardDelete = new PrismaClient();

describe("audit", () => {
  test("create", async () => {
    const ID = "new";
    const data = await prisma.user.create({
      data: { ID, Email: "new" },
    });
    const { Audit_ID, auditCreatedAt, ...result } =
      (await prismaHardDelete.user_Audit.findFirst({
        where: { ID },
      })) as User_Audit;

    const expected = Object.assign(data, { Action: AuditAction.CREATE });
    await prismaHardDelete.user.delete({ where: { ID } });
    await prismaHardDelete.user_Audit.deleteMany({ where: { ID } });
    expect(expected).toStrictEqual(result);
  });
  test("update", async () => {
    const ID = "new";
    await prismaHardDelete.user.create({
      data: { ID, Email: "old" },
    });
    const data = await prisma.user.update({
      where: { ID },
      data: { Email: "new" },
    });
    const { Audit_ID, auditCreatedAt, ...result } =
      (await prismaHardDelete.user_Audit.findFirst({
        where: { ID },
      })) as User_Audit;

    const expected = Object.assign(data, { Action: AuditAction.UPDATE });
    await prismaHardDelete.user.delete({ where: { ID } });
    await prismaHardDelete.user_Audit.deleteMany({ where: { ID } });
    expect(expected).toStrictEqual(result);
  });
  test("upsert", async () => {
    const ID = "new";
    const data = await prisma.user.upsert({
      where: { ID },
      create: { ID, Email: "new" },
      update: { ID, Email: "new" },
    });
    const { Audit_ID, auditCreatedAt, ...result } =
      (await prismaHardDelete.user_Audit.findFirst({
        where: { ID },
      })) as User_Audit;

    const expected = Object.assign(data, { Action: AuditAction.UPSERT });
    await prismaHardDelete.user.delete({ where: { ID } });
    await prismaHardDelete.user_Audit.deleteMany({ where: { ID } });
    expect(expected).toStrictEqual(result);
  });
  test("delete", async () => {
    const ID = "new";
    const data = await prismaHardDelete.user.create({
      data: { ID, Email: "new" },
    });
    await prisma.user.delete({
      where: { ID },
    });
    const { Audit_ID, auditCreatedAt, ...result } =
      (await prismaHardDelete.user_Audit.findFirst({
        where: { ID },
      })) as User_Audit;

    const expected = Object.assign(data, { Action: AuditAction.DELETE });
    // await prismaHardDelete.user.delete({ where: { ID } }); //already deleted
    await prismaHardDelete.user_Audit.deleteMany({ where: { ID } });
    expect(expected).toStrictEqual(result);
  });
  test("updateMany", async () => {
    const ID = "new";
    const ID2 = "old";
    //ignore updatedAt
    const { updatedAt: e, ...data } = await prismaHardDelete.user.create({
      data: { ID, Email: "new", First_Name: "test123456" },
    });
    //ignore updatedAt
    const { updatedAt: f, ...data2 } = await prismaHardDelete.user.create({
      data: { ID: ID2, Email: "old", First_Name: "test123456" },
    });
    await prisma.user.updateMany({
      where: { First_Name: "test123456" },
      data: { First_Name: "newtestusername" },
    });
    //ignore Audit_ID, auditCreatedAt, updatedAt
    const {
      Audit_ID: a,
      auditCreatedAt: b,
      updatedAt: c,
      ...result
    } = (await prismaHardDelete.user_Audit.findFirst({
      where: { ID },
    })) as User_Audit;
    //ignore Audit_ID, auditCreatedAt, updatedAt
    const {
      Audit_ID,
      auditCreatedAt,
      updatedAt: d,
      ...result2
    } = (await prismaHardDelete.user_Audit.findFirst({
      where: { ID: ID2 },
    })) as User_Audit;

    const expected = Object.assign(data, {
      Action: AuditAction.UPDATE,
      First_Name: "newtestusername",
    });
    const expected2 = Object.assign(data2, {
      Action: AuditAction.UPDATE,
      First_Name: "newtestusername",
    });
    await prismaHardDelete.user.deleteMany({
      where: { ID: { in: [ID, ID2] } },
    });
    await prismaHardDelete.user_Audit.deleteMany({
      where: { ID: { in: [ID, ID2] } },
    });
    expect(expected).toStrictEqual(result);
    expect(expected2).toStrictEqual(result2);
  });
  test("deleteMany", async () => {
    const ID = "new";
    const ID2 = "old";
    const data = await prismaHardDelete.user.create({
      data: { ID, Email: "new", First_Name: "test123456" },
    });
    const data2 = await prismaHardDelete.user.create({
      data: { ID: ID2, Email: "old", First_Name: "test123456" },
    });
    await prisma.user.deleteMany({
      where: { First_Name: "test123456" },
    });
    const {
      Audit_ID: a,
      auditCreatedAt: b,
      ...result
    } = (await prismaHardDelete.user_Audit.findFirst({
      where: { ID },
    })) as User_Audit;
    const { Audit_ID, auditCreatedAt, ...result2 } =
      (await prismaHardDelete.user_Audit.findFirst({
        where: { ID: ID2 },
      })) as User_Audit;

    const expected = Object.assign(data, {
      Action: AuditAction.DELETE,
    });
    const expected2 = Object.assign(data2, {
      Action: AuditAction.DELETE,
    });
    // await prismaHardDelete.user.deleteMany({
    //   where: { ID: { in: [ID, ID2] } },
    // });//already deleted
    await prismaHardDelete.user_Audit.deleteMany({
      where: { ID: { in: [ID, ID2] } },
    });
    expect(expected).toStrictEqual(result);
    expect(expected2).toStrictEqual(result2);
  });
});
