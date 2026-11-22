# Login OTP with TTL using Redis, Node.js & Express

## 1. What is Login OTP with TTL?

OTP stands for **One-Time Password**. It is a temporary code used to verify a user's identity during login.

TTL stands for **Time To Live**. It defines how long data should remain stored in Redis before it automatically expires.

In this project, we use Redis to:

- Generate and temporarily store an OTP for a user's phone number.
- Set an expiration time of 30 seconds.
- Verify the OTP entered by the user.
- Delete the OTP after successful verification.
- Check how much time is left before the OTP expires.

**Example:**

A user enters their phone number to log in.

1. Our backend generates a 6-digit OTP.
2. Redis stores that OTP against the user's phone number.
3. The OTP remains valid for 30 seconds.
4. The user enters the OTP.
5. Our backend checks whether the entered OTP matches the stored OTP.
6. If it matches, the OTP is deleted and verification is successful.
7. If the time expires, the OTP is automatically removed by Redis.

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

## 3. Create a Function for OTP Key

```js
function otpKey(phone) {
  return `otp:${phone}`;
}
```

**Purpose:** Creates a unique Redis key using the user's phone number.

### Explanation

- `otpKey(phone)`: A function that accepts a phone number.
- `` `otp:${phone}` ``: Creates a Redis key using a template literal.
- The phone number is added to the key so we can store and retrieve OTPs for different users separately.

**Example:**

If the phone number is `03001234567`, the Redis key will be:

```text
otp:03001234567
```

This allows Redis to store OTPs separately for different phone numbers.

## 4. POST – Generate and Store OTP

```js
app.post("/otp", async (req, res) => {
  const { phone } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redis.set(otpKey(phone), otp, "EX", 30);

  res.json({ message: "OTP Sent", otp });
});
```

**Purpose:** Generates an OTP and stores it in Redis for 30 seconds.

### Explanation

**1. Get the phone number**

```js
const { phone } = req.body;
```

Gets the phone number sent by the user in the request body.

**2. Generate a 6-digit OTP**

```js
const otp = Math.floor(100000 + Math.random() * 900000).toString();
```

Generates a random 6-digit number and converts it into a string.

**3. Store OTP in Redis with expiration**

```js
await redis.set(otpKey(phone), otp, "EX", 30);
```

This is the most important part.

- `redis.set()`: Stores data in Redis.
- `otpKey(phone)`: Specifies the Redis key.
- `otp`: The generated OTP.
- `'EX'`: Tells Redis to set an expiration time in seconds.
- `30`: The OTP will expire after 30 seconds.

**4. Send response**

```js
res.json({ message: "OTP Sent", otp });
```

Sends a response confirming that the OTP was generated.

### Example Request

**Method:** `POST`

**URL:**

```http
http://localhost:3000/otp
```

**JSON Body:**

```json
{
  "phone": "03001234567"
}
```

**Example Response:**

```json
{
  "message": "OTP Sent",
  "otp": "456789"
}
```

_Note: This example returns the OTP in the API response for learning and testing purposes. In a real login system, the OTP should be sent through an SMS provider, not returned to the user as an API response._

## 5. POST – Verify OTP

```js
app.post("/otp/verify", async (req, res) => {
  const { phone, otp } = req.body;

  const savedOtp = await redis.get(otpKey(phone));

  if (!savedOtp) {
    return res.status(400).json({
      message: "OTP Expired or Not Found",
    });
  }

  if (savedOtp !== otp) {
    return res.status(400).json({
      message: "Invalid OTP",
    });
  }

  await redis.del(otpKey(phone));

  res.json({
    message: "OTP Verified Successfully",
  });
});
```

**Purpose:** Checks whether the OTP entered by the user is correct and still valid.

### Explanation

**1. Get phone number and OTP**

```js
const { phone, otp } = req.body;
```

Gets the phone number and OTP entered by the user.

**2. Retrieve the saved OTP**

```js
const savedOtp = await redis.get(otpKey(phone));
```

Uses `redis.get()` to retrieve the OTP stored in Redis for that phone number.

**3. Check whether OTP exists**

```js
if (!savedOtp) {
  return res.status(400).json({
    message: "OTP Expired or Not Found",
  });
}
```

If Redis returns `null`, it means the OTP does not exist or has already expired.

**4. Check whether OTP matches**

```js
if (savedOtp !== otp) {
  return res.status(400).json({
    message: "Invalid OTP",
  });
}
```

Compares the OTP entered by the user with the OTP stored in Redis.

If they do not match, the backend returns an error.

**5. Delete OTP after successful verification**

```js
await redis.del(otpKey(phone));
```

Deletes the OTP from Redis after successful verification.

This makes the OTP usable only once.

**6. Send successful response**

```js
res.json({
  message: "OTP Verified Successfully",
});
```

Confirms that the OTP was verified successfully.

### Example Request

**Method:** `POST`

**URL:**

```http
http://localhost:3000/otp/verify
```

**JSON Body:**

```json
{
  "phone": "03001234567",
  "otp": "456789"
}
```

**Expected Response:**

```json
{
  "message": "OTP Verified Successfully"
}
```

## 6. GET – Check OTP TTL

```js
app.get("/otp/:phone/ttl", async (req, res) => {
  const ttl = await redis.ttl(otpKey(req.params.phone));

  res.json({ ttl });
});
```

**Purpose:** Checks how much time is remaining before the OTP expires.

### Explanation

**1. Get phone number from URL**

```js
req.params.phone;
```

Gets the phone number provided in the URL.

**2. Check remaining time**

```js
redis.ttl(otpKey(req.params.phone));
```

`redis.ttl()` returns the remaining lifetime of a Redis key in seconds.

**3. Send response**

```js
res.json({ ttl });
```

Returns the remaining time.

### Example Request

**Method:** `GET`

**URL:**

```http
http://localhost:3000/otp/03001234567/ttl
```

**Example Response:**

```json
{
  "ttl": 25
}
```

This means the OTP has approximately 25 seconds remaining before expiration.

### Important TTL Values

Redis can return three types of TTL results:

| Value           | Meaning                                |
| --------------- | -------------------------------------- |
| Positive number | Remaining time in seconds.             |
| `-1`            | Key exists but has no expiration time. |
| `-2`            | Key does not exist or has expired.     |

## 7. Start the Server

```js
app.listen(PORT, () => {
  console.log("Your App is Running on Port:", PORT);
});
```

This starts our Express server on the specified port.

## 8. API Endpoints Summary

| Method | Endpoint          | Purpose                                  |
| ------ | ----------------- | ---------------------------------------- |
| POST   | `/otp`            | Generate and store an OTP.               |
| POST   | `/otp/verify`     | Verify the OTP entered by the user.      |
| GET    | `/otp/:phone/ttl` | Check the remaining OTP expiration time. |

## 9. Important Redis Methods

| Redis Method  | Purpose                                        |
| ------------- | ---------------------------------------------- |
| `redis.set()` | Stores data in Redis.                          |
| `redis.get()` | Retrieves stored data.                         |
| `redis.del()` | Deletes a key and its value.                   |
| `redis.ttl()` | Checks the remaining expiration time of a key. |

### Important Redis Command: SET with EX

```js
await redis.set("otp:03001234567", "456789", "EX", 30);
```

This stores an OTP in Redis and automatically expires it after 30 seconds.

**Remember:**

- `EX` means expiration time in seconds.
- `30` means the data will expire after 30 seconds.
- Redis automatically removes expired keys.

## 10. Complete Working Flow

1. User submits their phone number.
2. Backend generates a 6-digit OTP.
3. Redis stores the OTP against that phone number.
4. Redis sets its expiration time to 30 seconds.
5. User receives the OTP.
6. User submits the OTP for verification.
7. Backend retrieves the saved OTP from Redis.
8. Backend checks whether the OTP exists and matches.
9. If correct, Redis deletes the OTP and verification succeeds.
10. If expired, Redis returns `null`, and verification fails.

## Notes Summary

**Login OTP with TTL:** A login verification system that uses Redis to temporarily store OTPs and automatically remove them after a specified amount of time.

**Main purpose:** To generate temporary OTPs, verify users, and automatically expire OTPs without manually deleting them.

**Remember these concepts:**

- `TTL` = Time To Live.
- `EX` = Expiration time in seconds.
- `redis.set()` = Store OTP.
- `redis.get()` = Retrieve OTP.
- `redis.del()` = Delete OTP.
- `redis.ttl()` = Check remaining expiration time.

**Main takeaway:** Redis TTL allows us to store temporary information and automatically delete it after a specific time. This makes Redis useful for OTP verification, temporary login codes, and other time-limited data.
