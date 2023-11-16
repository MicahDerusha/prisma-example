import { describe, expect, test } from "@jest/globals";
import { recursiveAddDeletedAt } from "../../../src/middleware/softDelete/addDeletedAtToWhere";

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
      Hear_About_Us: { Name: "abcd", User: { Name: "abcd company" } },
      User: {
        some: {
          Name: "abcd2",
          Hear_About_Us: { HearAboutUs: "Twitter" },
          createdAt: { gte: testDate },
        },
      },
    });
    expect(where.deletedAt).toBe(null);

    expect(where.Hear_About_Us.deletedAt).toBe(null);
    expect(where.Hear_About_Us.Name).toBe("abcd");
    expect(where.Hear_About_Us.User.deletedAt).toBe(null);
    expect(where.Hear_About_Us.User.Name).toBe("abcd company");

    expect(where.User.deletedAt).toBe(undefined);
    expect(where.User.some.deletedAt).toBe(null);
    expect(where.User.some.Name).toBe("abcd2");
    expect(where.User.some.Hear_About_Us.deletedAt).toBe(null);
    expect(where.User.some.Hear_About_Us.HearAboutUs).toBe("Twitter");
    expect(where.User.some.createdAt.deletedAt).toBe(undefined);
    expect(where.User.some.createdAt.gte).toStrictEqual(testDate);
  });
});
