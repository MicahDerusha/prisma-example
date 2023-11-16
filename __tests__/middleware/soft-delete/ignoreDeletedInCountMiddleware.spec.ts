import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ignoreDeletedInCountMiddleware } from "../../../src/middleware/softDelete/ignoreDeletedInCountMiddleware";

const prisma = new PrismaClient();
prisma.$use(ignoreDeletedInCountMiddleware); //on find: adds 'where deletedAt is null' to all queries and recursively to joins

describe("ignoreDeletedInCountMiddleware", () => {
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
    const result = await prisma.user.count({
      where: {
        First_Name: "user",
      },
    });
    expect(result).toBe(1);
  });
  test("no where includes active only", async () => {
    const result = await prisma.user.count({});
    expect(result).toBe(1);
  });
  test("can override soft delete filter", async () => {
    const result = await prisma.user.count({
      where: {
        deletedAt: today,
      },
    });
    expect(result).toBe(1);
  });
  test("overriding soft delete filter was not a false positive", async () => {
    const result = await prisma.user.count({
      where: {
        deletedAt: new Date(),
      },
    });
    expect(result).toBe(0);
  });
});
