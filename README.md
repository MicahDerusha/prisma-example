This repository is a collection of opinionated processes and middlewares that you can use to maximize the value of Prisma.

# Installation

1. Simply copy and paste the middlewares you want into your project
2. Use them by calling `prisma.$use(MIDDLEWARE)` on your top-level exported prisma client.
3. Make any modifications that you want
4. Take a look at our processes, so you know how to keep things working

# Philosophy

First, do no harm.
We started with the current prisma middleware examples in the official docs and made them better.
All middlewares are production-tested and being actively used by OpenPitch.com.
No maintenance necesssary, after changing the schema, just run `prisma generate`

# [Soft delete middleware](guides/soft-delete.md)

Improvements:

1. All return types are maintained
2. All reject on not found behavior is maintained
3. All middlewares work on all composite key tables
4. All prisma actions are handled (`findFirst`, `findMany`, `findUnique`, `findUniqueOrThrow` etc.)
5. Recursively filter any and all nested models
6. Conditionally return deleted records

# Audit middleware

Why you should use audit tables:

1. All database operations are recorded
2. Every value that was ever written to the database is recorded
3. All data is easily-restorable

# CMS Generator

Benefits:

1. Access your db directly from within your nextjs app
2. Keep a record of all actions

# TRPC Mutation logger

Log all state changing operations to a table. This way, you can easily replicate state and behavior when debugging.

# How to add ID col to existing table

If every table has an ID col, it becomes easier to add quality of life features to your prisma integration.

# How to use migrations to perform complex data migration

Learn how to use prisma migration files to handle most data migrations automatically with zero down-time.

## How to rename a col

By default, renaming a column in schema.prisma drops the old column and creates a new one, losing all of your data. See the easiest way to rename a column in prisma without data loss.

# Migrate database on push using github workflows

Never deploy a migration by hand again!

# How to control error msg on backend with global onError handler

No need to define an onError function in every single one of your tRPC client calls. Handle it in a central location on the frontend so error messages are completely controlled by the backend.

# How to log all errors to your logger

No need to manually log every backend error to your log server by hand. Handle it once on the backend so that all errors get sent automatically to your logger.

# How to have an express backend hosted on aws elastic beanstalk

Use a serverless frontend with an express backend for the perfect stack!

## Deploy to beanstalk on push using github workflows

Automatically update the backend on push along with the frontend and db for the perfect ci/cd pipeline.

## How to get nextAuth working with express and sockets

Learn how to make the best OSS auth library even better!
