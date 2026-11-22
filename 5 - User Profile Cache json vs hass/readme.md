# Storing User Data in Redis: JSON vs Hash

## 1. What are JSON and Hash in Redis?

Redis allows us to store data in different ways.

In this project, we are learning two methods:

**1. JSON String:** Stores an entire JavaScript object as a single string in Redis.

**2. Redis Hash:** Stores an object as separate field-value pairs under one Redis key.

Both methods can store user information, but they organize the data differently.

## 2. Understanding the Setup

### Import Packages

```js
import "dotenv/config";
import express from "express";
import Redis from "ioredis";
```

- `dotenv`: Loads environment variables from the `.env` file.
- `express`: Creates our backend server and API routes.
- `ioredis`: Connects our Node.js application with Redis.

### Initialize Express

```js
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
```

- `express()`: Creates our Express application.
- `PORT`: Defines the port on which our server runs.
- `express.json()`: Allows our application to receive and read JSON request data.

### Connect Redis

```js
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
```

This creates a connection between our Node.js application and Redis.

---

# Part 1: Store User Data as JSON

## 3. POST – Save User Data as JSON

```js
app.post("/user/:id/json", async (req, res) => {
  await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));

  res.json({ savedAs: "json" });
});
```

**Purpose:** Stores the entire user object as a JSON string in Redis.

### Explanation

**1. Get User ID**

```js
req.params.id;
```

Gets the user's ID from the URL.

For example:

```text
/user/101/json
```

Here, the user ID is `101`.

**2. Create Redis Key**

```js
`user:${req.params.id}:json`;
```

Creates a unique Redis key for that user.

Example:

```text
user:101:json
```

**3. Convert Object into JSON String**

```js
JSON.stringify(req.body);
```

Converts the JavaScript object into a JSON string because Redis stores string values.

Example JavaScript object:

```js
{
    name: "Habib",
    email: "habib@example.com",
    age: 22
}
```

After using `JSON.stringify()`:

```json
"{\"name\":\"Habib\",\"email\":\"habib@example.com\",\"age\":22}"
```

**4. Store Data in Redis**

```js
redis.set(key, value);
```

Stores the JSON string under the specified Redis key.

### Example Request

**Method:** `POST`

**URL:**

```http
http://localhost:3000/user/101/json
```

**JSON Body:**

```json
{
  "name": "Habib",
  "email": "habib@example.com",
  "age": 22
}
```

**Expected Response:**

```json
{
  "savedAs": "json"
}
```

## 4. GET – Retrieve User Data from JSON

```js
app.get("/user/:id/json", async (req, res) => {
  const raw = await redis.get(`user:${req.params.id}:json`);

  res.json({
    user: raw ? JSON.parse(raw) : null,
  });
});
```

**Purpose:** Retrieves the stored user object from Redis.

### Explanation

**1. Get User ID**

```js
req.params.id;
```

Gets the user ID from the URL.

**2. Retrieve Data from Redis**

```js
redis.get(`user:${req.params.id}:json`);
```

Retrieves the stored JSON string using its Redis key.

**3. Convert JSON String Back into an Object**

```js
JSON.parse(raw);
```

Converts the JSON string back into a JavaScript object.

**Remember:**

- `JSON.stringify()` converts an object into a JSON string.
- `JSON.parse()` converts a JSON string back into an object.

**4. Handle Missing Data**

```js
raw ? JSON.parse(raw) : null;
```

- If data exists, convert it back into an object.
- If data does not exist, return `null`.

### Expected Response

```json
{
  "user": {
    "name": "Habib",
    "email": "habib@example.com",
    "age": 22
  }
}
```

---

# Part 2: Store User Data as Redis Hash

## 5. What is Redis Hash?

A Redis Hash stores data as separate field-value pairs under a single Redis key.

For example, instead of storing the entire user object as one string, Redis stores each property separately.

Example:

| Field | Value             |
| ----- | ----------------- |
| name  | Habib             |
| email | habib@example.com |
| age   | 22                |

All these fields belong to one Redis key:

```text
user:101:hash
```

**Main idea:** A Redis Hash is useful when we want to work with individual fields of an object.

## 6. POST – Save User Data as Hash

```js
app.post("/user/:id/hash", async (req, res) => {
  await redis.hset(`user:${req.params.id}:hash`, req.body);

  res.json({ savedAs: "hash" });
});
```

**Purpose:** Stores the user's information as separate fields in a Redis Hash.

### Explanation

**1. Get User ID**

```js
req.params.id;
```

Gets the user ID from the URL.

**2. Create Redis Key**

```js
`user:${req.params.id}:hash`;
```

Creates a unique Redis key for the user.

Example:

```text
user:101:hash
```

**3. Store User Data Using HSET**

```js
redis.hset(key, req.body);
```

- `redis.hset()`: Stores data as field-value pairs.
- First argument: Redis key.
- Second argument: Object containing the fields and their values.

For example:

```js
{
    name: "Habib",
    email: "habib@example.com",
    age: 22
}
```

Redis stores the information as:

```text
Key: user:101:hash

name  → Habib
email → habib@example.com
age   → 22
```

**4. Send Response**

```js
res.json({ savedAs: "hash" });
```

Confirms that the data was saved as a Redis Hash.

### Example Request

**Method:** `POST`

**URL:**

```http
http://localhost:3000/user/101/hash
```

**JSON Body:**

```json
{
  "name": "Habib",
  "email": "habib@example.com",
  "age": 22
}
```

**Expected Response:**

```json
{
  "savedAs": "hash"
}
```

**Important:** Redis Hash field names and values are stored as strings. For example, the number `22` is returned as `"22"`.

## 7. GET – Retrieve User Data from Hash

```js
app.get("/user/:id/hash", async (req, res) => {
  const user = await redis.hgetall(`user:${req.params.id}:hash`);

  res.json({ user });
});
```

**Purpose:** Retrieves all fields and their values from a Redis Hash.

### Explanation

**1. Get User ID**

```js
req.params.id;
```

Gets the user ID from the URL.

**2. Retrieve All Hash Fields**

```js
redis.hgetall(`user:${req.params.id}:hash`);
```

- `redis.hgetall()`: Retrieves all fields and values from a Redis Hash.
- It returns the data as a JavaScript object.

**3. Send Response**

```js
res.json({ user });
```

Returns all retrieved user information.

### Example Request

**Method:** `GET`

**URL:**

```http
http://localhost:3000/user/101/hash
```

**Expected Response:**

```json
{
  "user": {
    "name": "Habib",
    "email": "habib@example.com",
    "age": "22"
  }
}
```

Notice that `age` is returned as a string rather than a number.

---

# Part 3: JSON vs Redis Hash

## 8. Main Differences

| JSON String                                | Redis Hash                                              |
| ------------------------------------------ | ------------------------------------------------------- |
| Stores the entire object as one string.    | Stores an object as separate fields.                    |
| Uses `SET` to save data.                   | Uses `HSET` to save data.                               |
| Uses `GET` to retrieve data.               | Uses `HGETALL` to retrieve all fields.                  |
| Requires `JSON.stringify()`.               | Does not require `JSON.stringify()` for simple objects. |
| Uses `JSON.parse()` to restore the object. | Returns an object containing string values.             |

### Example Difference

**JSON String:**

```text
user:101:json

"{\"name\":\"Habib\",\"age\":22}"
```

The entire object is stored as one string.

**Redis Hash:**

```text
user:101:hash

name → Habib
age  → 22
```

Each property is stored as an individual field.

## 9. Important Redis Commands

| Method            | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `redis.set()`     | Stores a value as a string.                  |
| `redis.get()`     | Retrieves a string value.                    |
| `redis.hset()`    | Stores fields and values in a Hash.          |
| `redis.hgetall()` | Retrieves all fields and values from a Hash. |

## 10. Important Things to Remember

**JSON:**

- `JSON.stringify()` converts an object into a JSON string.
- `JSON.parse()` converts a JSON string back into an object.
- `SET` stores the entire JSON string.
- Updating the JSON string replaces the previous stored value.

**Hash:**

- `HSET` stores data as field-value pairs.
- `HGETALL` retrieves all fields and their values.
- Hash values are returned as strings.
- Updating an existing field replaces its value.
- Adding a new field does not remove the other existing fields.

**Important:** Redis Hash is suitable for flat objects with simple string, number, or Boolean values. Nested objects and arrays need their own serialization before storing them in a Hash.

## 11. Complete Working Flow

1. Send a POST request to `/user/101/json` to save user data as a JSON string.
2. Send a GET request to `/user/101/json` to retrieve the saved JSON data.
3. Send a POST request to `/user/101/hash` to save user data as a Redis Hash.
4. Send a GET request to `/user/101/hash` to retrieve all Hash fields.
5. Compare how Redis stores and returns data using both methods.

## Notes Summary

**Redis JSON String:** Stores an entire JavaScript object as one JSON string using `SET`.

**Redis Hash:** Stores an object as separate field-value pairs using `HSET`.

**Main purpose:** To understand different ways of organizing and storing user information in Redis.

**Main takeaway:** JSON stores the entire object as one value, while Redis Hash stores the object's properties as separate fields under one key.
