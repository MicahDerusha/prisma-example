import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
} from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ignoreDeletedInAggregateMiddleware } from "../../../src/middleware/softDelete/ignoreDeletedInAggregateMiddleware";

const prisma = new PrismaClient();
prisma.$use(ignoreDeletedInAggregateMiddleware); //on find: adds 'where deletedAt is null' to all queries and recursively to joins

describe("ignoreDeletedInAggregateMiddleware", () => {
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
    const result = await prisma.user.aggregate({
      where: {
        First_Name: "user",
      },
      _count: true,
    });
    expect(result._count).toBe(1);
  });
  test("no where includes active only", async () => {
    const result = await prisma.user.aggregate({
      _count: true,
    });
    expect(result._count).toBe(1);
  });
  test("can override soft delete filter", async () => {
    const result = await prisma.user.aggregate({
      where: {
        deletedAt: today,
      },
      _count: true,
    });
    expect(result._count).toBe(1);
  });
  test("overriding soft delete filter was not a false positive", async () => {
    const result = await prisma.user.aggregate({
      where: {
        deletedAt: new Date(),
      },
      _count: true,
    });
    expect(result._count).toBe(0);
  });
});
