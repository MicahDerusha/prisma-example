MODIFYING A TABLE

Follow the action-specific instructions below and then:

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
- [ ] replace `Sent_Push_Notification` -> `YOUR_TABLE_NAME`
- [ ] replace `ID` -> `new_name`
- [ ] replace `Push_ID` -> `old_name`
- [ ] replace `VARCHAR(191)` -> `actual_type`


# SNIPPET:

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
