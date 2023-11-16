import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ignoreDeletedInGroupByMiddleware } from "../../../../prisma/middleware/softDelete/ignoreDeletedInGroupByMiddleware";
import test_company_a from "../../../../prisma/seed/Companies/test_company_a";
import path from "path";
import fsPromises from "fs/promises";

const prisma = new PrismaClient();
prisma.$use(ignoreDeletedInGroupByMiddleware); //on find: adds 'where deletedAt is null' to all queries and recursively to joins

describe("ignoreDeletedInGroupByMiddleware", () => {
  test("returns active records", async () => {
    await prisma.company_DEI_Gender.create({
      data: { Gender: "Female", Company_ID: test_company_a.company.ID },
    });
    await prisma.company_DEI_Gender.create({
      data: { Gender: "Male", Company_ID: test_company_a.company.ID },
    });
    const result = await prisma.company_DEI_Gender.groupBy({
      where: {
        Company_ID: test_company_a.company.ID,
      },
      by: ["Gender"],
    });
    await prisma.company_DEI_Gender.deleteMany({
      where: {
        Company_ID: test_company_a.company.ID,
      },
    });
    expect(result.length).toBe(2);
    expect(result.at(0)?.Gender).toBe("Male");
    expect(result.at(1)?.Gender).toBe("Female");
  });
  test("does not return deleted records", async () => {
    await prisma.company_DEI_Gender.create({
      data: {
        Gender: "Female",
        Company_ID: test_company_a.company.ID,
        deletedAt: new Date(),
      },
    });
    await prisma.company_DEI_Gender.create({
      data: {
        Gender: "Male",
        Company_ID: test_company_a.company.ID,
        deletedAt: new Date(),
      },
    });
    const result = await prisma.company_DEI_Gender.groupBy({
      where: {
        Company_ID: test_company_a.company.ID,
      },
      by: ["Gender"],
    });
    await prisma.company_DEI_Gender.deleteMany({
      where: {
        Company_ID: test_company_a.company.ID,
      },
    });
    expect(result.length).toBe(0);
  });
});
