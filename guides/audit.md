# Audit Table Guide

## TLDR

- By default, every table should be audited.

## Installation

1. Copy src/types folder into your project.
2. Copy src/utils folder into your project.
3. Copy src/middleware/audit.ts into your project.
4. Call `prisma.$use(createAuditLog)` as the last middleware on your top-level exported prisma client
5. Take a look at the maintenance section, so you know how to keep things working

## Maintenance

- Every table must have an audit table, unless it is not being audited. [Create an audit table](../processes/create-table.md#create-audit-table)
- In order to disable auditing on a table, add the table name to `TablesWithoutAudit` in `audit.ts`

## What is an audit table?

An audit table is a replica of a database table, that tracks changes over time. In a normal user table, each user is a single row.
In the user audit table, each user can be many rows. Any time a user is updated in the user table, a new row gets inserted into the user audit table.
Using audit tables, we can track every single change to ever happen in the db.

## Opinions

### When to use audit tables

By default, every table should be audited. If a table is extremely unimportant, and your schema.prisma has many files, you can omit an audit table to keep bundle size down. This will also help speed up the typescript compiler in vscode.
