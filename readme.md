## After changing anything in schema run
### Step:1
```
  bun run db:generate
```
will show this result

```
No config path provided, using default 'drizzle.config.ts'
Reading config file '/home/ab/Documents/OWN/space-vision-elysia/drizzle.config.ts'
2 tables
sessions 10 columns 0 indexes 0 fks
users 19 columns 0 indexes 0 fks
```

### Step:2
```
 bun run db:migrate
```
will show this result
```
db.configUrl postgresql://root:example@localhost:5432/space_vision
Running migrations...
✅ Migrations completed successfully
```

