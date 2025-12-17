# buzlyy
6482279

### Database
- The project uses Supabase / Postgres and Drizzle ORM.
- Run `npm run db:push` to apply the current schema to the configured `DATABASE_URL`.

#### Creating and applying new schema migrations
If you added new tables to `shared/schema.ts`, generate and apply a migration using:

```bash
export DATABASE_URL="postgres://user:password@localhost:5432/dbname"
npm run db:create-schema
```

This will:
- Generate a migration from the schema in `shared/schema.ts` into `./migrations`.
- Push the migration to the database configured by `DATABASE_URL`.

Note: The script uses `drizzle-kit` and requires `DATABASE_URL` to be set. If you only want to push the schema (no migration file) you can use `npm run db:push`.

#### Running a raw SQL script against Supabase/Postgres
If you prefer running a raw SQL script instead of a Drizzle migration, you can use the `supabase` CLI or `psql` to apply the `scripts/create_supabase_tables.sql` script directly.

- Using `psql`:
```bash
export DATABASE_URL="postgres://user:password@localhost:5432/dbname"
psql "$DATABASE_URL" -f scripts/create_supabase_tables.sql
or use the ordered Supabase schema:
```bash
psql "$DATABASE_URL" -f scripts/create_supabase_schema_ordered.sql
```
```

- Using `supabase` CLI (if set up):
```bash
supabase db remote set "$DATABASE_URL"
supabase db reset --db-url "$DATABASE_URL" --skip-seed
psql "$DATABASE_URL" -f scripts/create_supabase_tables.sql
```

Note: Always run the script on a test/development database before applying to production. The script includes `IF NOT EXISTS` checks but you should double-check the types and FK constraints against your existing schema.

- Built-in helper scripts:
	- `npm run db:create-schema` will generate a Drizzle migration and push it to the DB (recommended).
	- `npm run db:apply-sql` will execute `scripts/create_supabase_tables.sql` against the `DATABASE_URL` via `psql`.
