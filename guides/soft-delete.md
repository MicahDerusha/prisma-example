# Soft Delete Guide

## TLDR

- By default, every table should be soft-deleted.
- One-to-many relation tables should be hard-deleted. (any schema with composite primary key = `(User_ID,Organization_ID)` )
- Use `deletedAt DateTime?` to indicate if a record has been deleted

## Installation

1. Copy the entire softDelete folder in src/middleware/ into your project.
2. Copy the entire soft-delete section in index.ts into your top-level exported prisma client (the soft delete middlewares should come before all other middlewares)
3. Take a look at the maintenance section, so you know how to keep things working

## Maintenance

- Every table must have `deletedAt DateTime?` in their schema, even if they should get hard-deleted.
- In order to hard delete a table, add the table name to `hard_delete_models` in `setDeletedAtInsteadOfDeletingMiddleware`

## What is soft delete?

Soft deleting is the act of deleting a database row by setting a flag to true, instead of purging the row from the database.
Soft deleting records is the industry standard way of deleting data from a database.
Soft deleting allows you to keep data in your database that is associated with a deleted record, such as payment history.
In a traditional hard delete approach, normally foreign keys are set to cascade on delete, meaning that by deleting a user, you would also delete all of the user's payments.
In a soft delete approach, you could set the user's deleted flag to be true, while leaving their payment records unchanged.

## Opinions

### When to soft-delete

By default, every table should be soft-deleted. The main exception to this rule are one-to-many relation tables. An example of this is a table that stores which users belong to an organization (any schema with composite primary key = (User_ID,Organization_ID) ).
In a soft delete implementation, when these tables can be created and deleted at will by the user, you will get a unique constraint error if a user adds John Doe to an organization, then removes John Doe, then adds John Doe again.
The easiest fix is to hard-delete one-to-many relation tables.

### isDeleted vs deletedAt

Use deletedAt. It's better.
