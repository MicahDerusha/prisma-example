import { describe, expect, test, afterEach } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { addDeletedAtNullToUpsertMiddleware } from "../../../src/middleware/softDelete/addDeletedAtNullToUpsertMiddleware";

const prisma = new PrismaClient();
prisma.$use(addDeletedAtNullToUpsertMiddleware);

describe("addDeletedAtNullToUpsertMiddleware", () => {
  describe("on create", () => {
    describe("w/ deletedAt specified", () => {
      const data = {
        Email: "asdafasf",
        Password: "ABC123",
        ID: "new id asdas",
      };
      afterEach(async () => {
        await prisma.user.delete({
          where: { ID: data.ID },
        });
      });
      test("creating active record", async () => {
        const result = await prisma.user.upsert({
          create: { ...data, deletedAt: null },
          update: { ...data, deletedAt: null },
          where: { ID: data.ID },
        });
        expect(result.deletedAt).toBe(null);
        expect(result.Email).toBe(data.Email);
      });
      test("creating deleted record", async () => {
        const testDate = new Date();
        const result = await prisma.user.upsert({
          create: { ...data, deletedAt: testDate },
          update: { ...data, deletedAt: testDate },
          where: { ID: data.ID },
        });
        expect(result.deletedAt).toStrictEqual(testDate);
        expect(result.Email).toBe(data.Email);
      });
    });
    describe("w/ deletedAt un-specified", () => {
      const data = {
        Email: "asdafasf",
        Password: "ABC123",
        ID: "new id asdas",
      };
      afterEach(async () => {
        await prisma.user.delete({
          where: { ID: data.ID },
        });
      });
      test("creating active record", async () => {
        const result = await prisma.user.upsert({
          create: { ...data },
          update: { ...data },
          where: { ID: data.ID },
        });
        expect(result.deletedAt).toBe(null);
        expect(result.Email).toBe(data.Email);
      });
    });
  });
  describe("on update", () => {
    describe("w/ deletedAt specified", () => {
      const data = {
        Email: "asdafasf",
        Password: "ABC123",
        ID: "new id asdas",
      };
      afterEach(async () => {
        await prisma.user.delete({
          where: { ID: data.ID },
        });
      });
      test("deleted => active", async () => {
        await prisma.user.create({
          data: { ...data, deletedAt: new Date() },
        });
        const result = await prisma.user.upsert({
          create: { ...data, deletedAt: null, First_Name: "New name" },
          update: { deletedAt: null, First_Name: "New name" },
          where: { ID: data.ID },
        });
        expect(result.deletedAt).toBe(null);
        expect(result.First_Name).toBe("New name");
      });
      test("active => deleted", async () => {
        await prisma.user.create({
          data: { ...data, deletedAt: null },
        });
        const testDate = new Date();
        const result = await prisma.user.upsert({
          create: { ...data, deletedAt: testDate, First_Name: "New name" },
          update: { deletedAt: testDate, First_Name: "New name" },
          where: { ID: data.ID },
        });
        expect(result.deletedAt).toStrictEqual(testDate);
        expect(result.First_Name).toBe("New name");
      });
    });
    describe("w/ deletedAt un-specified", () => {
      const data = {
        Email: "asdafasf",
        Password: "ABC123",
        ID: "new id asdas",
      };
      afterEach(async () => {
        await prisma.user.delete({
          where: { ID: data.ID },
        });
      });
      test("deleted => active", async () => {
        await prisma.user.create({
          data: { ...data, deletedAt: new Date() },
        });
        const result = await prisma.user.upsert({
          create: { ...data, First_Name: "New name" },
          update: { First_Name: "New name" },
          where: { ID: data.ID },
        });
        expect(result.deletedAt).toBe(null);
        expect(result.First_Name).toBe("New name");
      });
      test("active => active", async () => {
        await prisma.user.create({
          data: { ...data, deletedAt: null },
        });
        const result = await prisma.user.upsert({
          create: { ...data, First_Name: "New name" },
          update: { First_Name: "New name" },
          where: { ID: data.ID },
        });
        expect(result.deletedAt).toBe(null);
        expect(result.First_Name).toBe("New name");
      });
    });
  });
});
