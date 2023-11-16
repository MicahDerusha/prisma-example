import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ignoreDeletedInGroupByMiddleware } from "../../../src/middleware/softDelete/ignoreDeletedInGroupByMiddleware";

const prisma = new PrismaClient();
prisma.$use(ignoreDeletedInGroupByMiddleware); //on find: adds 'where deletedAt is null' to all queries and recursively to joins

describe("ignoreDeletedInGroupByMiddleware", () => {
  const today = new Date();
  beforeAll(async () => {
    await prisma.user.create({
      data: {
        ID: "test active",
        Email: "test@example.com",
        Password: "pass",
        First_Name: "user",
      },
    });
    await prisma.user.create({
      data: {
        ID: "test deleted",
        Email: "deleted@example.com",
        Password: "pass",
        First_Name: "user",
        deletedAt: today,
      },
    });
  });
  afterAll(async () => {
    await prisma.user.deleteMany();
  });
  test("with where includes active only", async () => {
    const result = await prisma.user.groupBy({
      where: {
        First_Name: "user",
      },
      by: ["First_Name"],
      _count: true,
    });
    expect(result.length).toBe(1);
    expect(result[0]?._count).toBe(1);
  });
  test("no where includes active only", async () => {
    const result = await prisma.user.groupBy({
      by: ["First_Name"],
      _count: true,
    });
    expect(result.length).toBe(1);
    expect(result[0]?._count).toBe(1);
  });
  test("can override soft delete filter", async () => {
    const result = await prisma.user.groupBy({
      where: {
        deletedAt: today,
      },
      by: ["First_Name"],
      _count: true,
    });
    expect(result.length).toBe(1);
    expect(result[0]?._count).toBe(1);
  });
  test("overriding soft delete filter was not a false positive", async () => {
    const result = await prisma.user.groupBy({
      where: {
        deletedAt: new Date(),
      },
      by: ["First_Name"],
      _count: true,
    });
    expect(result.length).toBe(0);
  });
});
