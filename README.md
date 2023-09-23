# CREATING A NEW TABLE

** AFTER CREATING A NEW TABLE YOU MUST CREATE AN AUDIT TABLE AND RUN ALL DB TESTS **

## Every table must have:

- [ ] `ID String @id @default(nanoid(10))`
- [ ] `createdAt DateTime @default(now())`
- [ ] `updatedAt DateTime @updatedAt`
- [ ] `deletedAt DateTime?`

### Example

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

## For all new enums:

in db/prisma/schemas/ :

- [ ] create a `uniquefieldliteral` schema
- [ ] create a `options` array
      in app\src\components\shared\form\Form.tsx :
- [ ] add the new schema to the mapping
      in app\src\components\admin\tables\database-tables\actions\update-row.tsx :
- [ ] add the new options

## Create audit table

- [ ] copy the original model
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

### Example

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

## Update zod schemas

- [ ] un-comment the zod generator in db/schema.prisma
- [ ] run `db-generate`
- [ ] discard changes to existing schemas (except index)
- [ ] replace all `z.nativeEnum()` with the schema in db/prisma/schemas/
- [ ] comment the zod generator

## Decide if the table should be hard-deleted

Relationship tables should be hard deleted
so that we can easily re-create the relationship when need be.
If the table should be hard-deleted:

- [ ] Add table name to `hard_delete_models` in db\prisma\middleware\softDelete\ignoreDeletedInUpdateMiddleware.ts

# MODIFYING A TABLE

Follow the action-specific instructions below and then:

- [ ] un-comment the zod generator and run db-generate
- [ ] discard changes to the other models that you arent modifying
- [ ] Revert any unexpected changes to your model (Only keep changes related to the change you are making)

## removing a col

- [ ] make col optional in the audit table

## renaming a col

- [ ] rename the col in the audit table
- [ ] also follow instructions in the RENAMING A COL section

## adding a col

- [ ] add the col in the audit table, make optional

# RENAMING A COL

- [ ] create the migration
- [ ] copy the snippet below into the migration
- [ ] replace `Sent_Push_Notification` -> `YOUR_TABLE_NAME`
- [ ] replace `ID` -> `new_name`
- [ ] replace `Push_ID` -> `old_name`
- [ ] replace `VARCHAR(191)` -> `actual_type`

## SNIPPET:

```
-- Sent_Push_Notification
-- add new col (nullable)
ALTER TABLE `Sent_Push_Notification` ADD COLUMN `ID` VARCHAR(191) NULL;
-- migrate values from old col -> new col
UPDATE `Sent_Push_Notification` SET `ID` = `Push_ID` WHERE 1;
-- set new col not null
ALTER TABLE `Sent_Push_Notification` MODIFY `ID` VARCHAR(191) NOT NULL;
-- drop old primary key
ALTER TABLE `Sent_Push_Notification` DROP PRIMARY KEY,
DROP COLUMN `Push_ID`,
-- add new primary key
ADD PRIMARY KEY (`ID`);

---

-- Sent_Push_Notification_Audit
-- add new col (nullable)
ALTER TABLE `Sent_Push_Notification_Audit` ADD COLUMN `ID` VARCHAR(191) NULL;
-- migrate values from old col -> new col
UPDATE `Sent_Push_Notification_Audit` SET `ID` = `Push_ID` WHERE 1;
-- set new col not null
ALTER TABLE `Sent_Push_Notification_Audit` MODIFY `ID` VARCHAR(191) NOT NULL;
-- drop old col
ALTER TABLE `Sent_Push_Notification_Audit` DROP COLUMN `Push_ID`;

```

# ADDING A PK ID COL TO A TABLE

- [ ] add this col to the table: `ID String @id @default(nanoid(10))`
- [ ] add this col to the audit table: `ID String?`
- [ ] create a migration w/ create only
- [ ] add this to the end of the migration: `UPDATE \`NEW_TABLE\` set \`ID\` = (SELECT UUID());`
- [ ] commit these changes
- [ ] comment out all the relations on the table
- [ ] create a migration w/ create only (& commit these changes)
- [ ] in data table, change the new `ID` col to `@id` and remove the optional `?` (dont do this in audit table)
- [ ] change any `@id` -> `@unique` / `@@id` -> `@@unique`
- [ ] create a migration w/ create only (& commit these changes)
- [ ] un-comment all the relations on the table
- [ ] create a migration w/ create only (& commit these changes)
