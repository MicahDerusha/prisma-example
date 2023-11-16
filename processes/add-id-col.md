ADDING A PRIMARY KEY ID COLUMN TO A TABLE

- [ ] add this col to the table: `ID String? @default(nanoid(10))`
- [ ] add this col to the audit table: `ID String?`
- [ ] create a migration w/ create only
- [ ] add this to the end of the migration: ``` UPDATE `NEW_TABLE` set `ID` = (SELECT UUID()); ```
- [ ] commit these changes
- [ ] comment out all the relations on the table
- [ ] create a migration w/ create only (& commit these changes)
- [ ] in data table, add `@id` and remove the optional `?` (dont do this in audit table)
- [ ] change any `@id` -> `@unique` / `@@id` -> `@@unique`
- [ ] create a migration w/ create only (& commit these changes)
- [ ] un-comment all the relations on the table
- [ ] create a migration w/ create only (& commit these changes)
