CREATING A NEW TABLE

** AFTER CREATING A NEW TABLE YOU MUST CREATE AN AUDIT TABLE AND RUN ALL DB TESTS **

# Every table must have:

- [ ] `ID String @id @default(nanoid(10))`
- [ ] `createdAt DateTime @default(now())`
- [ ] `updatedAt DateTime @updatedAt`
- [ ] `deletedAt DateTime?`

# Example

```
model Example {
    //Dimensions
    ID String @id @default(nanoid(10))

    //Facts

    //Metadata
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    deletedAt DateTime?

    //Relations
}
```

# Create audit table

Creating an audit table

- [ ] copy the original model
- [ ] name the audit model `${ORIGINAL_MODEL_NAME}_Audit`
- [ ] remove all @id
- [ ] remove all @unique and @@unique
- [ ] remove all @default
- [ ] remove all @updatedAt
- [ ] remove all relations
- [ ] change all enums -> string
- [ ] preserve Json data type
- [ ] preserve optional fields
- [ ] add col: `Audit_ID String @id @default(nanoid(15))`
- [ ] add col: `Action AuditAction`
- [ ] add col: `auditCreatedAt DateTime @default(now())`

## Example

```
model Example_Audit {
    Audit_ID String @id @default(nanoid(15))
    Action AuditAction
    //Dimensions
    ID String

    //Facts

    //Metadata
    createdAt DateTime
    updatedAt DateTime
    deletedAt DateTime?

    auditCreatedAt DateTime @default(now())
}
```

# Decide if the table should be hard-deleted

Relationship tables should be hard deleted
so that we can easily re-create the relationship when need be.
If the table should be hard-deleted:

- [ ] Add table name to `hard_delete_models` in db\prisma\middleware\softDelete\ignoreDeletedInUpdateMiddleware.ts

# For all new enums: (CMS USERS ONLY)

in db/prisma/schemas/ :

- [ ] create a `uniquefieldliteral` schema
- [ ] create a `options` array
      in app\src\components\shared\form\Form.tsx :
- [ ] add the new schema to the mapping
      in app\src\components\admin\tables\database-tables\actions\update-row.tsx :
- [ ] add the new options

# Update zod schemas: (CMS USERS ONLY)

- [ ] un-comment the zod generator in db/schema.prisma
- [ ] run `db-generate`
- [ ] discard changes to existing schemas (except index)
- [ ] replace all `z.nativeEnum()` with the schema in db/prisma/schemas/
- [ ] re-comment the zod generator
