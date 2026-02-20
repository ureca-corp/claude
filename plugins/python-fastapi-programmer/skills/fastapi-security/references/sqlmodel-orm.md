# SQLModel ORM Patterns

## Rules

1. **Never** use raw SQL
2. **Always** use SQLModel ORM (select, add, commit, get)

## Patterns

### Create
```python
user = User(email=email, password_hash=hash)
db.add(user)
db.commit()
db.refresh(user)
```

### Read
```python
# By ID
user = db.get(User, user_id)

# By filter
user = db.exec(select(User).where(User.email == email)).first()
users = db.exec(select(User).where(User.active == True)).all()
```

### Update
```python
user.name = "New Name"
db.commit()
```

### Delete
```python
db.delete(user)
db.commit()
```

## ❌ Forbidden

```python
# Raw SQL - NEVER DO THIS
db.execute("SELECT * FROM users WHERE email = ?", [email])
db.execute("INSERT INTO users ...")
cursor.fetchall()
```
