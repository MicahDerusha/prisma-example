import { describe, expect, test } from "@jest/globals";
import { recursiveFilterDeletedRecords } from "../../../src/middleware/softDelete/filterDeletedRecordsMiddleware";

describe("recursiveFilterDeletedRecords", () => {
  test("filters items from array", () => {
    const input = {
      Name: "abcd company",
      Numbers: [12, 80000],
      Account: [
        {
          Name: "deleted",
          deletedAt: new Date(),
          Transaction: [
            { Amount: 1, deletedAt: null },
            { Amount: 2, deletedAt: new Date() },
            {
              Amount: 3,
              deletedAt: { prisma__type: "null", prisma__value: null }, //regression test. catches when returning raw records via queryRaw
            },
          ],
        },
        {
          Name: "active",
          deletedAt: null,
          Transaction: [
            { Amount: 1, deletedAt: null },
            { Amount: 2, deletedAt: new Date() },
            {
              Amount: 3,
              deletedAt: { prisma__type: "null", prisma__value: null }, //regression test. catches when returning raw records via queryRaw
            },
          ],
        },
      ],
      deletedAt: null,
    };
    const output = recursiveFilterDeletedRecords(input);

    expect(output.Numbers.length).toBe(2);
    expect(output.Numbers.at(0)).toBe(12);
    expect(output.Numbers.at(1)).toBe(80000);
    expect(output.Account.length).toBe(1);
    expect(output.Account.at(0).Name).toBe("active");
    expect(output.Account.at(0).deletedAt).toBe(null);
    expect(output.Account.at(0).Transaction.length).toBe(2);
    expect(output.Account.at(0).Transaction.at(0).Amount).toBe(1);
    expect(output.Account.at(0).Transaction.at(1).Amount).toBe(3);
  });
});
