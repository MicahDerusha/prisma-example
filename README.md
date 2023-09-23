This repository is a collection of opinionated processes and middlewares that you can use to maximize the value of Prisma.

# Installation
1. Simply copy and paste the middlewares you want into your project
2. Use them by calling `prisma.$use(MIDDLEWARE)` on your top-level exported prisma client.
3. Make any modifications that you want
4. Take a look at our processes, so you know how to keep things working

# Philosophy
First, do no harm. 
We started with the current prisma middleware examples in the official docs and made them better.
All middlewares are production-tested and being actively used by OpenPitch.com
No maintenance necesssary, after changing the schema, just run `prisma generate`

# Soft delete middleware
Improvements:
1. All return types are maintained
2. All reject on not found behavior is maintained
3. All middlewares work on all composite key tables
4. All prisma actions are handled (`findFirst`, `findMany`, `findUnique`, `findUniqueOrThrow` etc.)
5. Recursively filter any and all nested models

# Audit middleware
Why you should use audit tables:
1. All database operations are recorded
2. Every value that was ever written to the database is recorded
3. All data is easily-restorable
