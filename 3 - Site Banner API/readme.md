# Site Banner API with Redis, Node.js & Express

## 1. What is a Site Banner API?

A Site Banner API allows us to create, display, check, and delete a website banner message using Redis.

For example, imagine an academy website displaying this message:

**"Welcome to our Academy! New courses are now available."**

Instead of writing this message directly into our website's code, we can store it in Redis and manage it through API endpoints.

This allows us to change or remove the banner message without changing the website's code.

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
- `express.json()`: Allows our application to receive and read JSON data from requests.

**Important:** Without `express.json()`, we cannot directly access JSON request data through `req.body`.

### Connect Redis

```js
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
```

This creates a connection between our Node.js application and Redis.

### Create a Redis Key

```js
const BANNER_KEY = "app:banner";
```

A Redis key is the name used to store and retrieve data.

Here:

- `BANNER_KEY` is a constant variable.
- `"app:banner"` is the Redis key.
- We use this same key whenever we want to access our banner message.

**Remember:** Redis stores data using key-value pairs.

Example:

| Key          | Value             |
| ------------ | ----------------- |
| `app:banner` | Welcome to Redis! |

## 3. POST – Store or Update Banner Message

```js
app.post("/banner", async (req, res) => {
  await redis.set(BANNER_KEY, req.body.message || "Welcome to Redis!");

  res.json({ success: true });
});
```

**Purpose:** Stores a new banner message in Redis.

### Explanation

- `app.post('/banner')`: Creates a POST API endpoint.
- `req.body.message`: Gets the banner message sent by the user.
- `redis.set()`: Stores the message in Redis using the specified key.
- `"Welcome to Redis!"`: Default message used when no message is provided or the supplied message is empty.
- `success: true`: Sends a successful response.

### Example Request

**Method:** `POST`

**URL:** `http://localhost:3000/banner`

**JSON Body:**

```json
{
  "message": "Welcome to our Academy!"
}
```

**Expected Response:**

```json
{
  "success": true
}
```

**Note:** If we use `redis.set()` with an existing key, Redis replaces its previous value with the new one.

## 4. GET – Retrieve Banner Message

```js
app.get("/banner", async (req, res) => {
  const message = await redis.get(BANNER_KEY);

  res.json({ message });
});
```

**Purpose:** Retrieves the stored banner message from Redis.

### Explanation

- `app.get('/banner')`: Creates a GET API endpoint.
- `redis.get()`: Retrieves the value stored under the specified Redis key.
- `BANNER_KEY`: Identifies which data we want to retrieve.
- `res.json()`: Sends the retrieved message as a JSON response.

### Expected Response

```json
{
  "message": "Welcome to our Academy!"
}
```

**Note:** If the key does not exist, `redis.get()` returns `null`.

## 5. DELETE – Remove Banner Message

```js
app.delete("/banner", async (req, res) => {
  await redis.del(BANNER_KEY);

  res.json({ success: true });
});
```

**Purpose:** Deletes the banner message from Redis.

### Explanation

- `app.delete('/banner')`: Creates a DELETE API endpoint.
- `redis.del()`: Deletes the specified key and its stored value.
- `BANNER_KEY`: Identifies which data we want to delete.
- `success: true`: Sends a successful response.

### Expected Response

```json
{
  "success": true
}
```

**Note:** This endpoint returns `success: true` even when the key does not exist because the code does not check the result of `redis.del()`.

## 6. EXISTS – Check Whether Banner Exists

```js
app.get("/banner/exists", async (req, res) => {
  const exists = await redis.exists(BANNER_KEY);

  res.json({ exists: Boolean(exists) });
});
```

**Purpose:** Checks whether the banner message exists in Redis.

### Explanation

- `app.get('/banner/exists')`: Creates a GET API endpoint.
- `redis.exists()`: Checks whether the specified key exists in Redis.
- `Boolean(exists)`: Converts Redis's numeric result into a Boolean value.

Redis returns:

- `1` = Key exists.
- `0` = Key does not exist.

### Expected Response

**When the banner exists:**

```json
{
  "exists": true
}
```

**When the banner does not exist:**

```json
{
  "exists": false
}
```

## 7. Start the Server

```js
app.listen(PORT, () => {
  console.log("Your App is Running on Port:", PORT);
});
```

This starts our Express server on the specified port.

## 8. API Endpoints Summary

| Method | Endpoint         | Purpose                             |
| ------ | ---------------- | ----------------------------------- |
| POST   | `/banner`        | Store or update the banner message. |
| GET    | `/banner`        | Retrieve the banner message.        |
| DELETE | `/banner`        | Delete the banner message.          |
| GET    | `/banner/exists` | Check whether the banner exists.    |

## 9. Important Redis Methods

| Redis Method     | Purpose                      |
| ---------------- | ---------------------------- |
| `redis.set()`    | Stores data using a key.     |
| `redis.get()`    | Retrieves data using a key.  |
| `redis.del()`    | Deletes a key and its value. |
| `redis.exists()` | Checks whether a key exists. |

## 10. Complete Working Flow

1. Send a POST request to `/banner` to store a banner message in Redis.
2. Redis saves the message under the `app:banner` key.
3. Send a GET request to `/banner` to retrieve the message.
4. Send a GET request to `/banner/exists` to check whether the message exists.
5. Send a DELETE request to `/banner` to remove the message.

## Notes Summary

**Site Banner API:** A simple API that uses Redis to store, retrieve, update, check, and delete a website banner message.

**Main purpose:** To manage website banner messages without hardcoding them into the frontend.

**Remember:** Redis stores the banner message as a value, and `app:banner` is the key used to access that value.

This project demonstrates basic Redis operations: `SET`, `GET`, `DEL`, and `EXISTS`.
