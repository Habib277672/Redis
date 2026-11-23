# Email Queue System with Redis, Node.js & Express

## 1. What is a Queue in Redis?

A Queue is a system that stores tasks and processes them one by one in a specific order.

In this project, we use Redis to create an email queue.

Imagine a website where users submit email requests at the same time.

Instead of processing every email immediately, we can:

1. Receive an email request.
2. Store it in a Redis Queue.
3. Take one email job from the queue.
4. Process that email job.

**Example:**

Three users request emails:

- User A requests an email.
- User B requests an email.
- User C requests an email.

Redis stores all three email jobs in a queue and processes them in the order they were added.

**Main purpose:** To manage tasks and process them in an organized order instead of handling everything at once.

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

Creates a connection between our Node.js application and Redis.

## 3. Create a Queue Key

```js
const QUEUE_KEY = "queue:emails";
```

**Purpose:** Defines the Redis key where we will store all email jobs.

- `QUEUE_KEY`: A constant variable.
- `"queue:emails"`: The name of our Redis Queue.

**Remember:** Redis uses this key to identify our email queue.

## 4. POST – Add Email Job to Queue

```js
app.post("/emails", async (req, res) => {
  const job = {
    to: req.body.to,
    subject: req.body.subject || "No Subject",
    body: req.body.body || "No Content",
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(QUEUE_KEY, JSON.stringify(job));

  res.json({ queued: true, job });
});
```

**Purpose:** Receives an email request and adds it to the Redis Queue.

### Explanation

**1. Create an Email Job**

```js
const job = {
  to: req.body.to,
  subject: req.body.subject || "No Subject",
  body: req.body.body || "No Content",
  createdAt: new Date().toISOString(),
};
```

Creates an object containing all the information required for an email.

- `to`: Email address of the receiver.
- `subject`: Subject of the email.
- `body`: Content of the email.
- `createdAt`: Date and time when the job was created.

**2. Understand Default Values**

```js
req.body.subject || "No Subject";
```

If the user does not provide a subject, we use `"No Subject"` as the default value.

Similarly:

```js
req.body.body || "No Content";
```

If the user does not provide email content, we use `"No Content"`.

**3. Add Job to Redis Queue**

```js
await redis.lpush(QUEUE_KEY, JSON.stringify(job));
```

This is the most important part.

- `redis.lpush()`: Adds a new item to the left side of a Redis List.
- `QUEUE_KEY`: Identifies our email queue.
- `JSON.stringify(job)`: Converts the JavaScript object into a JSON string before storing it.

**Remember:** Redis Lists allow us to store multiple items in an ordered list.

**4. Send Response**

```js
res.json({ queued: true, job });
```

Confirms that the email job has been added to the queue.

### Example Request

**Method:** `POST`

**URL:**

```http
http://localhost:3000/emails
```

**JSON Body:**

```json
{
  "to": "user@example.com",
  "subject": "Welcome to Our Academy",
  "body": "Thank you for joining our academy!"
}
```

**Expected Response:**

```json
{
  "queued": true,
  "job": {
    "to": "user@example.com",
    "subject": "Welcome to Our Academy",
    "body": "Thank you for joining our academy!",
    "createdAt": "2026-11-23T12:00:00.000Z"
  }
}
```

_Note: The `createdAt` value is an example. Your application generates the actual date and time._

## 5. GET – Process One Email Job

```js
app.get("/emails/process-one", async (req, res) => {
  const rawjob = await redis.rpop(QUEUE_KEY);

  if (!rawjob) {
    return res.status(400).json("Job not Found");
  }

  const job = JSON.parse(rawjob);

  res.json({
    message: "Email Sent",
    job,
  });
});
```

**Purpose:** Takes one email job from the Redis Queue and processes it.

### Explanation

**1. Retrieve One Job from Queue**

```js
const rawjob = await redis.rpop(QUEUE_KEY);
```

- `redis.rpop()`: Removes and returns one item from the right side of a Redis List.
- `QUEUE_KEY`: Identifies the email queue.

**2. Check Whether a Job Exists**

```js
if (!rawjob) {
  return res.status(400).json("Job not Found");
}
```

If the queue is empty, Redis returns `null`.

We check whether a job exists before processing it.

**3. Convert JSON String Back into an Object**

```js
const job = JSON.parse(rawjob);
```

Since we stored the job using `JSON.stringify()`, we use `JSON.parse()` to convert it back into a JavaScript object.

**4. Send Response**

```js
res.json({
  message: "Email Sent",
  job,
});
```

Returns the processed job.

### Example Request

**Method:** `GET`

**URL:**

```http
http://localhost:3000/emails/process-one
```

**Expected Response:**

```json
{
  "message": "Email Sent",
  "job": {
    "to": "user@example.com",
    "subject": "Welcome to Our Academy",
    "body": "Thank you for joining our academy!",
    "createdAt": "2026-11-23T12:00:00.000Z"
  }
}
```

**Note:** This project only simulates email processing. It does not actually send emails through an email service.

## 6. Understanding LPUSH and RPOP

These two Redis methods are responsible for managing the order of our email jobs.

### LPUSH

```js
await redis.lpush(QUEUE_KEY, job);
```

Adds a new item to the left side of a Redis List.

### RPOP

```js
await redis.rpop(QUEUE_KEY);
```

Removes and returns an item from the right side of a Redis List.

### Why do we use them together?

We use `LPUSH` to add new jobs to the left and `RPOP` to process jobs from the right.

This makes our queue follow **FIFO (First In, First Out)**.

FIFO means the job added first will be processed first.

### Example

Suppose we add three jobs:

```text
LPUSH → Job A
LPUSH → Job B
LPUSH → Job C
```

Redis List:

```text
LEFT                         RIGHT

Job C  ←  Job B  ←  Job A
```

When we use `RPOP`:

1. First, Job A is removed.
2. Then, Job B is removed.
3. Finally, Job C is removed.

**Remember:** The oldest job gets processed first.

## 7. What is FIFO?

FIFO stands for **First In, First Out**.

It means the first item added to a queue is the first item removed.

Real-life example:

Imagine people standing in a line at a ticket counter.

- The first person to join the line gets served first.
- The second person gets served second.
- The third person gets served third.

Redis Queue works in a similar way when we use `LPUSH` and `RPOP`.

## 8. Important Redis Methods

| Redis Method    | Purpose                                                          |
| --------------- | ---------------------------------------------------------------- |
| `redis.lpush()` | Adds an item to the left side of a Redis List.                   |
| `redis.rpop()`  | Removes and returns an item from the right side of a Redis List. |

## 9. Complete Working Flow

1. A user sends an email request through `POST /emails`.
2. Our backend creates an email job.
3. `JSON.stringify()` converts the job into a JSON string.
4. `redis.lpush()` adds the job to the Redis Queue.
5. Another request calls `GET /emails/process-one`.
6. `redis.rpop()` retrieves and removes the oldest job.
7. `JSON.parse()` converts the job back into a JavaScript object.
8. Our application returns the processed job.

## 10. Notes Summary

**Redis Queue:** A system that uses Redis Lists to store tasks and process them in an organized order.

**Main purpose:** To manage tasks such as emails, notifications, and background jobs so they can be processed one by one.

**Important concepts:**

- `QUEUE_KEY`: Name of our Redis Queue.
- `LPUSH`: Adds a job to the left side of the list.
- `RPOP`: Removes a job from the right side of the list.
- `FIFO`: First In, First Out.
- `JSON.stringify()`: Converts an object into a JSON string.
- `JSON.parse()`: Converts a JSON string back into an object.

**Main takeaway:** Redis Lists can be used to create a queue where we store jobs and process them in the order they were added.
