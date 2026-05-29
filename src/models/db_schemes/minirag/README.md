## Run Alembic Migrations

### Configuration

```bash
cp alembic.ini.example alembic.ini
```

-Update the `alembic.ini` with your database credentials (`sqlalchemy.rul`)

```bash
alembic revision --autogenerate -m "add...."
alembic upgrade head
```
