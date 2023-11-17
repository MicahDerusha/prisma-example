MODIFYING A TABLE

(CMS USERS ONLY) Follow the action-specific instructions below and then:

- [ ] un-comment the zod generator and run db-generate
- [ ] discard changes to the other models that you arent modifying
- [ ] Revert any unexpected changes to your model (Only keep changes related to the change you are making)

# removing a col

- [ ] make col optional in the audit table

# adding a col

- [ ] add the col in the audit table, make optional

# renaming a col

- [ ] rename the col in the audit table
- [ ] create the migration
- [ ] copy the snippet below into the migration
- [ ] replace `User` -> `YOUR_TABLE_NAME`
- [ ] replace `NEW_COL_NAME` with your desired new column name
- [ ] replace `OLD_COL_NAME` with the actual name in your db
- [ ] replace `VARCHAR(191)` with the actual type in your db

## SNIPPET:

```
-- User
-- add new col (nullable)
ALTER TABLE `User` ADD COLUMN `NEW_COL_NAME` VARCHAR(191) NULL;
-- migrate values from old col -> new col
UPDATE `User` SET `NEW_COL_NAME` = `OLD_COL_NAME` WHERE 1;
-- set new col not null
ALTER TABLE `User` MODIFY `NEW_COL_NAME` VARCHAR(191) NOT NULL;
-- drop old primary key
ALTER TABLE `User` DROP PRIMARY KEY,
DROP COLUMN `OLD_COL_NAME`,
-- add new primary key
ADD PRIMARY KEY (`NEW_COL_NAME`);

---

-- Sent_Push_Notification_Audit
-- add new col (nullable)
ALTER TABLE `Sent_Push_Notification_Audit` ADD COLUMN `NEW_COL_NAME` VARCHAR(191) NULL;
-- migrate values from old col -> new col
UPDATE `Sent_Push_Notification_Audit` SET `NEW_COL_NAME` = `OLD_COL_NAME` WHERE 1;
-- set new col not null
ALTER TABLE `Sent_Push_Notification_Audit` MODIFY `NEW_COL_NAME` VARCHAR(191) NOT NULL;
-- drop old col
ALTER TABLE `Sent_Push_Notification_Audit` DROP COLUMN `OLD_COL_NAME`;

```

# adding a primary key ID column to an existing table

- [ ] add this col to the table: `ID String? @default(nanoid(10))`
- [ ] add this col to the audit table: `ID String?`
- [ ] create a migration w/ create only
- [ ] add this to the end of the migration: `` UPDATE `NEW_TABLE` set `ID` = (SELECT UUID()); ``
- [ ] commit these changes
- [ ] comment out all the relations on the table
- [ ] create a migration w/ create only (& commit these changes)
- [ ] in data table, add `@id` and remove the optional `?` (dont do this in audit table)
- [ ] change any `@id` -> `@unique` / `@@id` -> `@@unique`
- [ ] create a migration w/ create only (& commit these changes)
- [ ] un-comment all the relations on the table
- [ ] create a migration w/ create only (& commit these changes)
