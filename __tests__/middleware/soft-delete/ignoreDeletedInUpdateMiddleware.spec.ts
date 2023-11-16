import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ignoreDeletedInUpdateMiddleware } from "../../../../prisma/middleware/softDelete/ignoreDeletedInUpdateMiddleware";
import test_company_a from "../../../../prisma/seed/Companies/test_company_a";

const prisma = new PrismaClient();
prisma.$use(ignoreDeletedInUpdateMiddleware); //on update: adds 'where deletedAt is null' to all queries and recursively to joins)

describe("ignoreDeletedInUpdateMiddleware", () => {
  describe("works for composite key tables", () => {
    test("update works with active records", async () => {
      await prisma.company_DEI_Gender.create({
        data: { Gender: "Female", Company_ID: test_company_a.company.ID },
      });
      const result = await prisma.company_DEI_Gender.update({
        where: {
          Company_ID_Gender: {
            Gender: "Female",
            Company_ID: test_company_a.company.ID,
          },
        },
        data: { Gender: "Male" },
      });
      await prisma.company_DEI_Gender.deleteMany({
        where: {
          Company_ID: test_company_a.company.ID,
        },
      });
      expect(result.Gender).toBe("Male");
    });
    test("update does not work on deleted records", async () => {
      await prisma.company_DEI_Gender.create({
        data: {
          Gender: "Female",
          Company_ID: test_company_a.company.ID,
          deletedAt: new Date(),
        },
      });
      await expect(
        prisma.company_DEI_Gender.update({
          where: {
            Company_ID_Gender: {
              Gender: "Female",
              Company_ID: test_company_a.company.ID,
            },
          },
          data: { Gender: "Male" },
        })
      ).rejects.toThrow();
      await prisma.company_DEI_Gender.deleteMany({
        where: {
          Company_ID: test_company_a.company.ID,
        },
      });
    });
    test("updateMany works with active records", async () => {
      await prisma.company_DEI_Gender.create({
        data: { Gender: "Female", Company_ID: test_company_a.company.ID },
      });
      await prisma.company_DEI_Gender.create({
        data: { Gender: "Male", Company_ID: test_company_a.company.ID },
      });
      const now = new Date();
      await prisma.company_DEI_Gender.updateMany({
        where: {
          Company_ID: test_company_a.company.ID,
        },
        data: { createdAt: now },
      });
      const result = await prisma.company_DEI_Gender.findMany({
        where: {
          Company_ID: test_company_a.company.ID,
        },
      });
      await prisma.company_DEI_Gender.deleteMany({
        where: {
          Company_ID: test_company_a.company.ID,
        },
      });
      expect(result.at(0)?.createdAt).toStrictEqual(now);
      expect(result.at(1)?.createdAt).toStrictEqual(now);
    });
    test("updateMany does not work on deleted records", async () => {
      const deletedAt = new Date();
      await prisma.company_DEI_Gender.create({
        data: {
          Gender: "Female",
          Company_ID: test_company_a.company.ID,
          deletedAt,
        },
      });
      await prisma.company_DEI_Gender.create({
        data: {
          Gender: "Male",
          Company_ID: test_company_a.company.ID,
          deletedAt,
        },
      });
      await prisma.company_DEI_Gender.updateMany({
        where: {
          Company_ID: test_company_a.company.ID,
        },
        data: { deletedAt: null },
      });
      const result = await prisma.company_DEI_Gender.findMany({
        where: {
          Company_ID: test_company_a.company.ID,
        },
      });
      await prisma.company_DEI_Gender.deleteMany({
        where: {
          Company_ID: test_company_a.company.ID,
        },
      });
      expect(result.at(0)?.deletedAt).toStrictEqual(deletedAt);
      expect(result.at(1)?.deletedAt).toStrictEqual(deletedAt);
    });
  });
});
