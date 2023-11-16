import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ignoreDeletedInFindMiddleware } from "../../../../prisma/middleware/softDelete/ignoreDeletedInFindMiddleware";
import test_company_a from "../../../../prisma/seed/Companies/test_company_a";

const prisma = new PrismaClient();
prisma.$use(ignoreDeletedInFindMiddleware); //on find: adds 'where deletedAt is null' to all queries and recursively to joins

describe("ignoreDeletedInFindMiddleware", () => {
  describe("works for composite key tables", () => {
    beforeAll(async () => {
      await prisma.company_DEI_Gender.create({
        data: { Gender: "Female", Company_ID: test_company_a.company.ID },
      });
      await prisma.company_DEI_Gender.create({
        data: {
          Gender: "Male",
          Company_ID: test_company_a.company.ID,
          deletedAt: new Date(),
        },
      });
    });
    afterAll(async () => {
      await prisma.company_DEI_Gender.deleteMany({
        where: {
          Company_ID: test_company_a.company.ID,
        },
      });
    });
    test("findFirst returns active records", async () => {
      const result = await prisma.company_DEI_Gender.findFirst({
        where: {
          Gender: "Female",
          Company_ID: test_company_a.company.ID,
        },
      });
      expect(result?.Gender).toBe("Female");
    });
    test("findFirst does not return deleted records", async () => {
      const result = await prisma.company_DEI_Gender.findFirst({
        where: {
          Gender: "Male",
          Company_ID: test_company_a.company.ID,
        },
      });
      expect(result).toBe(null);
    });
    test("findFirstOrThrow returns active records", async () => {
      const result = await prisma.company_DEI_Gender.findFirstOrThrow({
        where: {
          Gender: "Female",
          Company_ID: test_company_a.company.ID,
        },
      });
      expect(result?.Gender).toBe("Female");
    });
    test("findFirstOrThrow does not return deleted records", async () => {
      await expect(
        prisma.company_DEI_Gender.findFirstOrThrow({
          where: {
            Gender: "Male",
            Company_ID: test_company_a.company.ID,
          },
        })
      ).rejects.toThrow();
    });
    test("findMany returns active records", async () => {
      const result = await prisma.company_DEI_Gender.findMany({
        where: {
          Gender: "Female",
          Company_ID: test_company_a.company.ID,
        },
      });
      expect(result[0]?.Gender).toBe("Female");
    });
    test("findMany does not return deleted records", async () => {
      const result = await prisma.company_DEI_Gender.findMany({
        where: {
          Gender: "Male",
          Company_ID: test_company_a.company.ID,
        },
      });
      expect(result.length).toBe(0);
    });
    test("findUnique returns active records", async () => {
      const result = await prisma.company_DEI_Gender.findUnique({
        where: {
          Company_ID_Gender: {
            Gender: "Female",
            Company_ID: test_company_a.company.ID,
          },
        },
      });
      expect(result?.Gender).toBe("Female");
    });
    test("findUnique does not return deleted records", async () => {
      const result = await prisma.company_DEI_Gender.findUnique({
        where: {
          Company_ID_Gender: {
            Gender: "Male",
            Company_ID: test_company_a.company.ID,
          },
        },
      });
      expect(result).toBe(null);
    });
    test("findUniqueOrThrow returns active records", async () => {
      const result = await prisma.company_DEI_Gender.findUniqueOrThrow({
        where: {
          Company_ID_Gender: {
            Gender: "Female",
            Company_ID: test_company_a.company.ID,
          },
        },
      });
      expect(result?.Gender).toBe("Female");
    });
    test("findUniqueOrThrow does not return deleted records", async () => {
      await expect(
        prisma.company_DEI_Gender.findUniqueOrThrow({
          where: {
            Company_ID_Gender: {
              Gender: "Male",
              Company_ID: test_company_a.company.ID,
            },
          },
        })
      ).rejects.toThrow();
    });
  });
  describe("works for non-composite key tables", () => {
    beforeAll(async () => {
      await prisma.user.create({
        data: { Email: "active", ID: "active" },
      });
      await prisma.user.create({
        data: { Email: "deleted", ID: "deleted", deletedAt: new Date() },
      });
    });
    afterAll(async () => {
      await prisma.user.delete({
        where: { ID: "active" },
      });
      await prisma.user.delete({
        where: { ID: "deleted" },
      });
    });
    test("findFirst returns active records", async () => {
      const result = await prisma.user.findFirst({
        where: {
          Email: "active",
        },
      });
      expect(result?.Email).toBe("active");
    });
    test("findFirst does not return deleted records", async () => {
      const result = await prisma.user.findFirst({
        where: {
          Email: "deleted",
        },
      });
      expect(result).toBe(null);
    });
    test("findFirstOrThrow returns active records", async () => {
      const result = await prisma.user.findFirstOrThrow({
        where: {
          Email: "active",
        },
      });
      expect(result?.Email).toBe("active");
    });
    test("findFirstOrThrow does not return deleted records", async () => {
      await expect(
        prisma.user.findFirstOrThrow({
          where: {
            Email: "deleted",
          },
        })
      ).rejects.toThrow();
    });
    test("findMany returns active records", async () => {
      const result = await prisma.user.findMany({
        where: {
          Email: "active",
        },
      });
      expect(result[0]?.Email).toBe("active");
    });
    test("findMany does not return deleted records", async () => {
      const result = await prisma.user.findMany({
        where: {
          Email: "deleted",
        },
      });
      expect(result.length).toBe(0);
    });
    test("findUnique returns active records", async () => {
      const result = await prisma.user.findUnique({
        where: {
          ID: "active",
        },
      });
      expect(result?.Email).toBe("active");
    });
    test("findUnique does not return deleted records", async () => {
      const result = await prisma.user.findUnique({
        where: {
          ID: "deleted",
        },
      });
      expect(result).toBe(null);
    });
    test("findUniqueOrThrow returns active records", async () => {
      const result = await prisma.user.findUniqueOrThrow({
        where: {
          ID: "active",
        },
      });
      expect(result?.Email).toBe("active");
    });
    test("findUniqueOrThrow does not return deleted records", async () => {
      await expect(
        prisma.user.findUniqueOrThrow({
          where: {
            ID: "deleted",
          },
        })
      ).rejects.toThrow();
    });
  });
});
