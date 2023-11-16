import { afterAll, beforeAll, describe, expect, test } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ignoreDeletedInFindMiddleware } from "../../../src/middleware/softDelete/ignoreDeletedInFindMiddleware";

const prisma = new PrismaClient();
prisma.$use(ignoreDeletedInFindMiddleware); //on find: adds 'where deletedAt is null' to all queries and recursively to joins

describe("ignoreDeletedInFindMiddleware", () => {
  describe("works for composite key tables", () => {
    beforeAll(async () => {
      const user = await prisma.user.create({
        data: {
          ID: "test 3",
          Email: "abc@example.com",
          Password: "pass",
          First_Name: "name",
        },
      });
      await prisma.hear_About_Us.create({
        data: { HearAboutUs: "Friend", User_ID: "test 3" },
      });
      await prisma.hear_About_Us.create({
        data: {
          HearAboutUs: "LinkedIn",
          User_ID: "test 3",
          deletedAt: new Date(),
        },
      });
    });
    afterAll(async () => {
      await prisma.hear_About_Us.deleteMany({});
      await prisma.user.deleteMany({});
    });
    test("findFirst returns active records", async () => {
      const result = await prisma.hear_About_Us.findFirst({
        where: {
          HearAboutUs: "Friend",
        },
      });
      expect(result?.HearAboutUs).toBe("Friend");
    });
    test("findFirst does not return deleted records", async () => {
      const result = await prisma.hear_About_Us.findFirst({
        where: {
          HearAboutUs: "LinkedIn",
        },
      });
      expect(result).toBe(null);
    });
    test("findFirstOrThrow returns active records", async () => {
      const result = await prisma.hear_About_Us.findFirstOrThrow({
        where: {
          HearAboutUs: "Friend",
        },
      });
      expect(result?.HearAboutUs).toBe("Friend");
    });
    test("findFirstOrThrow does not return deleted records", async () => {
      await expect(
        prisma.hear_About_Us.findFirstOrThrow({
          where: {
            HearAboutUs: "LinkedIn",
          },
        })
      ).rejects.toThrow();
    });
    test("findMany returns active records", async () => {
      const result = await prisma.hear_About_Us.findMany({
        where: {
          HearAboutUs: "Friend",
        },
      });
      expect(result.length).toBe(1);
      expect(result[0]?.HearAboutUs).toBe("Friend");
    });
    test("findMany does not return deleted records", async () => {
      const result = await prisma.hear_About_Us.findMany({
        where: {
          HearAboutUs: "LinkedIn",
        },
      });
      expect(result.length).toBe(0);
    });
    test("findUnique returns active records", async () => {
      const result = await prisma.hear_About_Us.findUnique({
        where: {
          User_ID_HearAboutUs: {
            HearAboutUs: "Friend",
            User_ID: "test 3",
          },
        },
      });
      expect(result?.HearAboutUs).toBe("Friend");
    });
    test("findUnique does not return deleted records", async () => {
      const result = await prisma.hear_About_Us.findUnique({
        where: {
          User_ID_HearAboutUs: {
            HearAboutUs: "LinkedIn",
            User_ID: "test 3",
          },
        },
      });
      expect(result).toBe(null);
    });
    test("findUniqueOrThrow returns active records", async () => {
      const result = await prisma.hear_About_Us.findUniqueOrThrow({
        where: {
          User_ID_HearAboutUs: {
            HearAboutUs: "Friend",
            User_ID: "test 3",
          },
        },
      });
      expect(result?.HearAboutUs).toBe("Friend");
    });
    test("findUniqueOrThrow does not return deleted records", async () => {
      await expect(
        prisma.hear_About_Us.findUniqueOrThrow({
          where: {
            User_ID_HearAboutUs: {
              HearAboutUs: "LinkedIn",
              User_ID: "test 3",
            },
          },
        })
      ).rejects.toThrow();
    });
  });
  describe("works for non-composite key tables", () => {
    const today = new Date();
    beforeAll(async () => {
      await prisma.user.create({
        data: {
          ID: "active",
          Email: "active",
          Password: "pass",
          First_Name: "name",
        },
      });
      await prisma.user.create({
        data: {
          ID: "deleted",
          Email: "deleted",
          Password: "pass",
          First_Name: "name",
          deletedAt: today,
        },
      });
    });
    afterAll(async () => {
      await prisma.user.deleteMany({});
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
