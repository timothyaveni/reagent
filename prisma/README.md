This schema is licensed under the Apache license v2, meaning it can be used even outside of AGPL-licensed projects -- excuse the temporary solution of just mentioning this in this folder while I figure out a better way to organize this project structure


To create a migration from my dev server, I manually run (and manually createa the folder):

```
dev-utils/prisma-remix.sh migrate diff --from-url "postgresql://postgres:pg_dev_password@postgres:5432/postgres?schema=public" --to-schema-datamodel /app/prisma/schema.prisma --script > prisma/migrations/20250314125900_caseInsensitiveInvites/migration.sql
```

```
dev-utils/prisma-remix.sh migrate status
dev-utils/prisma-remix.sh migrate dev
```

In prod, need to rebuild the docker image for the migrations to be in there -- which is a little awkward because then the db is out of sync with the product, but that happens one way or another...