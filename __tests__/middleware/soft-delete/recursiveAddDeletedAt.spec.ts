import { describe, expect, test } from "@jest/globals";
import { Dimension_Date } from "@prisma/client";
import { getDateString } from "@investii/utils/src/utils/dateUtils";
import { recursiveAddDeletedAt } from "../../../../prisma/middleware/softDelete/addDeletedAtToWhere";

describe("recursiveAddDeletedAt", () => {
  test("undefined", () => {
    const where = recursiveAddDeletedAt(undefined);
    expect(where.deletedAt).toBe(null);
    expect(Object.keys(where).length).toBe(1);
  });
  test("null", () => {
    const where = recursiveAddDeletedAt(null);
    expect(where.deletedAt).toBe(null);
    expect(Object.keys(where).length).toBe(1);
  });
  test("empty object", () => {
    const where = recursiveAddDeletedAt({});
    expect(where.deletedAt).toBe(null);
    expect(Object.keys(where).length).toBe(1);
  });
  test("kitchen sink", () => {
    const testDate = new Date();
    const where = recursiveAddDeletedAt({
      Account: { Name: "abcd", Company: { Name: "abcd company" } },
      User: {
        some: {
          Name: "abcd2",
          Company: { Name: "abcd2 company" },
          createdAt: { gte: testDate },
        },
      },
    });

    expect(where.deletedAt).toBe(null);

    expect(where.Account.deletedAt).toBe(null);
    expect(where.Account.Name).toBe("abcd");
    expect(where.Account.Company.deletedAt).toBe(null);
    expect(where.Account.Company.Name).toBe("abcd company");

    expect(where.User.deletedAt).toBe(undefined);
    expect(where.User.some.deletedAt).toBe(null);
    expect(where.User.some.Name).toBe("abcd2");
    expect(where.User.some.Company.deletedAt).toBe(null);
    expect(where.User.some.Company.Name).toBe("abcd2 company");
    expect(where.User.some.createdAt.deletedAt).toBe(undefined);
    expect(where.User.some.createdAt.gte).toStrictEqual(testDate);
  });
});
