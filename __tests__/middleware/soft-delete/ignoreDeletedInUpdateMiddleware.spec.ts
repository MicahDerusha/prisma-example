import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { ignoreDeletedInUpdateMiddleware } from "../../../src/middleware/softDelete/ignoreDeletedInUpdateMiddleware";

const prisma = new PrismaClient();
prisma.$use(ignoreDeletedInUpdateMiddleware); //on update: adds 'where deletedAt is null' to all queries and recursively to joins)

describe("ignoreDeletedInUpdateMiddleware", () => {
  describe("works for composite key tables", () => {
    const now = new Date();
    beforeEach(async () => {
      await prisma.user.create({
        data: { Email: "new_user", ID: "new_user", Password: "pass" },
      });
      await prisma.hear_About_Us.create({
        data: { HearAboutUs: "Friend", User_ID: "new_user" },
      });
      await prisma.hear_About_Us.create({
        data: {
          HearAboutUs: "LinkedIn",
          User_ID: "new_user",
          deletedAt: now,
        },
      });
    });
    afterEach(async () => {
      await prisma.hear_About_Us.deleteMany({});
      await prisma.user.deleteMany({});
    });
    test("update works with active records", async () => {
      const result = await prisma.hear_About_Us.update({
        where: {
          User_ID_HearAboutUs: {
            HearAboutUs: "Friend",
            User_ID: "new_user",
          },
        },
        data: { HearAboutUs: "Twitter" },
      });
      expect(result.HearAboutUs).toBe("Twitter");
    });
    test("update does not work on deleted records", async () => {
      await expect(
        prisma.hear_About_Us.update({
          where: {
            User_ID_HearAboutUs: {
              HearAboutUs: "LinkedIn",
              User_ID: "new_user",
            },
          },
          data: { HearAboutUs: "Twitter" },
        })
      ).rejects.toThrow();
    });
    test("updateMany works with active records", async () => {
      await prisma.hear_About_Us.updateMany({
        where: {
          User_ID: "new_user",
        },
        data: { createdAt: now },
      });
      const result = await prisma.hear_About_Us.findMany({
        where: {
          createdAt: now,
        },
      });
      expect(result.length).toBe(1);
      expect(result.at(0)?.HearAboutUs).toBe("Friend");
    });
    test("updateMany does not work on deleted records", async () => {
      await prisma.hear_About_Us.updateMany({
        where: {
          HearAboutUs: "LinkedIn",
        },
        data: { deletedAt: null },
      });
      const result = await prisma.hear_About_Us.findMany({
        where: {
          HearAboutUs: "LinkedIn",
        },
      });
      expect(result.length).toBe(1);
      expect(result.at(0)?.deletedAt).toStrictEqual(now);
    });
  });
});
