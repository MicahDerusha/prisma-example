import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";
import { PrismaClient, Prisma, AuditAction, User_Audit } from "@prisma/client";
import { createAuditLog } from "../../src/middleware/audit";

const prisma = new PrismaClient();
prisma.$use(createAuditLog);
const prismaHardDelete = new PrismaClient();

describe("audit", () => {
  beforeEach(() => {});
  afterEach(async () => {
    await prismaHardDelete.user.deleteMany();
    await prismaHardDelete.user_Audit.deleteMany();
  });
  test("create", async () => {
    const ID = "new";
    const data = await prisma.user.create({
      data: { ID, Email: "new", Password: "pass" },
    });
    const { Audit_ID, auditCreatedAt, ...result } =
      (await prismaHardDelete.user_Audit.findFirst({
        where: { ID },
      })) as User_Audit;

    const expected = Object.assign(data, { Action: AuditAction.CREATE });
    expect(expected).toStrictEqual(result);
  });
  test("update", async () => {
    const ID = "new";
    await prismaHardDelete.user.create({
      data: { ID, Email: "old", Password: "pass" },
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
    expect(expected).toStrictEqual(result);
  });
  test("upsert", async () => {
    const ID = "new";
    const data = await prisma.user.upsert({
      where: { ID },
      create: { ID, Email: "new", Password: "pass" },
      update: { ID, Email: "new" },
    });
    const { Audit_ID, auditCreatedAt, ...result } =
      (await prismaHardDelete.user_Audit.findFirst({
        where: { ID },
      })) as User_Audit;

    const expected = Object.assign(data, { Action: AuditAction.UPSERT });
    expect(expected).toStrictEqual(result);
  });
  test("delete", async () => {
    const ID = "new";
    const data = await prismaHardDelete.user.create({
      data: { ID, Email: "new", Password: "pass" },
    });
    await prisma.user.delete({
      where: { ID },
    });
    const { Audit_ID, auditCreatedAt, ...result } =
      (await prismaHardDelete.user_Audit.findFirst({
        where: { ID },
      })) as User_Audit;

    const expected = Object.assign(data, { Action: AuditAction.DELETE });
    expect(expected).toStrictEqual(result);
  });
  test("updateMany", async () => {
    const ID = "new";
    const ID2 = "old";
    //ignore updatedAt
    const { updatedAt: e, ...data } = await prismaHardDelete.user.create({
      data: { ID, Email: "new", First_Name: "test123456", Password: "pass" },
    });
    //ignore updatedAt
    const { updatedAt: f, ...data2 } = await prismaHardDelete.user.create({
      data: {
        ID: ID2,
        Email: "old",
        First_Name: "test123456",
        Password: "pass",
      },
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
    expect(expected).toStrictEqual(result);
    expect(expected2).toStrictEqual(result2);
  });
  test("deleteMany", async () => {
    const ID = "new";
    const ID2 = "old";
    const data = await prismaHardDelete.user.create({
      data: { ID, Email: "new", First_Name: "test123456", Password: "pass" },
    });
    const data2 = await prismaHardDelete.user.create({
      data: {
        ID: ID2,
        Email: "old",
        First_Name: "test123456",
        Password: "pass",
      },
    });
    await prisma.user.deleteMany({});
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
    expect(expected).toStrictEqual(result);
    expect(expected2).toStrictEqual(result2);
  });
});
