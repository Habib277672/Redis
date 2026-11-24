# BullMQ: Welcome Email Queue with Worker & Retries

## 1. What is BullMQ?

BullMQ is a Node.js library that helps us manage background jobs using Redis.

It allows us to add jobs to a queue and process them separately using Workers.

For example, imagine a user registers on your website.

You want to send them a welcome email, but you don't want the user to wait while your application sends that email.

Instead, we can:

1. Create a welcome email job.
2. Add that job to a BullMQ queue.
3. A Worker picks up the job.
4. The Worker processes the job in the background.
5. If the job fails, BullMQ can automatically retry it.

**Main purpose:** To handle tasks in the background without making users wait for those tasks to finish.

## 2. Why do we use BullMQ?

We use BullMQ to:

- Handle background tasks such as sending emails.
- Process multiple jobs through Workers.
- Automatically retry jobs when they fail.
- Manage jobs without blocking the main API request.
- Keep track of job status, such as waiting, active, completed, and failed.

**Example:** When a user registers, your API can immediately add a welcome email job to the queue and respond to the user. The Worker handles the email separately.

## 3. Understanding Our Project Structure

We have three main files:

```text
project/
│
├── index.js
├── queue.js
├── worker.js
├── .env
└── package.json
```

**Purpose of each file:**

| File | Purpose |
|---|---|
| `index.js` | Receives API requests and adds jobs to the queue. |
| `queue.js` | Creates the BullMQ queue and Redis connection settings. |
| `worker.js` | Picks up jobs and processes them in the background. |

Think of it like this:

- `index.js` creates and sends the work.
- `queue.js` manages the queue.
- `worker.js` performs the work.

## 4. Install Required Packages

Run this command in your terminal:

```bash
npm install bullmq express dotenv
```

Make sure your `package.json` contains:

```json
{
    "type": "module"
}
```

This allows us to use ES Module syntax such as `import` and `export`.

Also, make sure your Redis server is running on port `6379`.

---

# Part 1: Queue Setup (queue.js)

## 5. Create a BullMQ Queue

```js
import { Queue } from 'bullmq';

const connection = {
    host: 'localhost',
    port: 6379
};

const emailQueue = new Queue('emails', { connection });

export {
    emailQueue,
    connection
};
```

**Purpose:** Creates a queue named `emails` and connects it to Redis.

### Explanation

**1. Import Queue**

```js
import { Queue } from 'bullmq';
```

Imports the `Queue` class from BullMQ.

We use this class to create queues and add jobs to them.

**2. Configure Redis Connection**

```js
const connection = {
    host: 'localhost',
    port: 6379
};
```

- `host`: Address of our Redis server.
- `port`: Port on which Redis is running.

**3. Create Email Queue**

```js
const emailQueue = new Queue('emails', { connection });
```

- `new Queue()`: Creates a new BullMQ queue.
- `'emails'`: Name of our queue.
- `{ connection }`: Tells BullMQ which Redis server to use.

**Remember:** We will use the same queue name in our Worker so it can process the jobs added to this queue.

**4. Export Queue and Connection**

```js
export {
    emailQueue,
    connection
};
```

We export both variables so other files can use them.

- `emailQueue`: Used in `index.js` to add jobs.
- `connection`: Used in `worker.js` to connect the Worker to Redis.

---

# Part 2: Adding Jobs to Queue (index.js)

## 6. Initialize Express and Import Queue

```js
import "dotenv/config";
import express from "express";
import { emailQueue } from "./queue.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
```

### Explanation

- `dotenv`: Loads environment variables.
- `express`: Creates our backend server.
- `emailQueue`: Imports the queue we created in `queue.js`.
- `express.json()`: Allows our application to receive JSON request data.

## 7. POST – Add Welcome Email Job

```js
app.post("/welcome-email", async (req, res) => {
    const job = await emailQueue.add(
        "send-welcome-email",
        {
            to: req.body.to,
            name: req.body.name || "Learner",
        },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 1000,
            },
        },
    );

    res.json({
        message: "Welcome email job added to the queue!",
        job: {
            id: job.id,
            name: job.name,
            data: job.data
        }
    });
});
```

**Purpose:** Receives a welcome email request and adds it to the BullMQ queue.

### Explanation

**1. Create POST Route**

```js
app.post("/welcome-email", async (req, res) => {
```

Creates an API endpoint that accepts POST requests.

**2. Add Job to Queue**

```js
const job = await emailQueue.add(
    "send-welcome-email",
    {
        to: req.body.to,
        name: req.body.name || "Learner",
    }
);
```

`emailQueue.add()` is used to add a new job to the queue.

It accepts three important arguments:

**First argument: Job Name**

```js
"send-welcome-email"
```

This identifies what type of job we want to process.

**Second argument: Job Data**

```js
{
    to: req.body.to,
    name: req.body.name || "Learner",
}
```

This contains the information our Worker needs.

- `to`: Email address of the receiver.
- `name`: Name of the receiver.
- `"Learner"`: Default name if the user does not provide one.

**Third argument: Job Options**

```js
{
    attempts: 3,
    backoff: {
        type: "exponential",
        delay: 1000,
    },
}
```

These options control what happens when a job fails.

Let's understand them separately.

### 8. Understanding Attempts

```js
attempts: 3
```

Defines the maximum number of times BullMQ can try to process a job.

For example:

- First attempt: Job processing starts.
- Second attempt: If the first attempt fails, BullMQ tries again.
- Third attempt: If the second attempt also fails, BullMQ tries one final time.

**Important:** `attempts: 3` means three total attempts, not three additional retries.

### 9. Understanding Exponential Backoff

```js
backoff: {
    type: "exponential",
    delay: 1000,
}
```

Backoff defines how long BullMQ should wait before retrying a failed job.

`exponential` means the waiting time increases after every failed attempt.

Here, our starting delay is `1000` milliseconds (1 second).

Example:

| Attempt | Result | Waiting Time Before Next Attempt |
|---|---|---|
| First | Failed | 1 second |
| Second | Failed | 2 seconds |
| Third | Failed | No more retries |

**Remember:** Exponential backoff increases the waiting time between retries instead of retrying immediately.

### 10. Send API Response

```js
res.json({
    message: "Welcome email job added to the queue!",
    job: {
        id: job.id,
        name: job.name,
        data: job.data
    }
});
```

After adding the job, we send its information back to the user.

- `job.id`: Unique ID of the job.
- `job.name`: Name of the job.
- `job.data`: Information stored inside the job.

## 11. Start Express Server

```js
app.listen(PORT, () => {
    console.log("Your App is Running on Port:", PORT);
});
```

This starts our Express server.

---

# Part 3: Processing Jobs with Worker (worker.js)

## 12. What is a Worker in BullMQ?

A Worker is responsible for picking up jobs from a queue and processing them.

In our project:

- `index.js` adds welcome email jobs.
- `worker.js` picks up those jobs.
- The Worker processes them in the background.

**Remember:** A Queue adds jobs, while a Worker processes jobs.

## 13. Import Worker and Connection

```js
import { Worker } from "bullmq";
import { connection } from "./queue.js";
```

- `Worker`: Imported from BullMQ to create a Worker.
- `connection`: Imported from `queue.js` to connect the Worker to Redis.

## 14. Create a Worker

```js
const worker = new Worker(
    "emails",
    async (job) => {
        console.log(
            "Processing email job...",
            job.id,
            job.name,
            job.data
        );

        await new Promise((resolve) =>
            setTimeout(resolve, 1500)
        );

        console.log(
            "Email job Completed",
            job.id,
            job.name,
            job.data
        );
    },
    { connection },
);
```

**Purpose:** Creates a Worker that listens to the `emails` queue and processes incoming jobs.

### Explanation

**1. Specify Queue Name**

```js
"emails"
```

This tells the Worker which queue it should listen to.

**Important:** The queue name must match the name used in `queue.js`.

**2. Job Processor Function**

```js
async (job) => {
    // Processing logic
}
```

This function runs whenever the Worker picks up a job.

The `job` object contains information about the job.

For example:

- `job.id`: Unique job ID.
- `job.name`: Job name.
- `job.data`: Job information.

**3. Understand the Delay**

```js
await new Promise((resolve) =>
    setTimeout(resolve, 1500)
);
```

This creates a delay of 1.5 seconds.

We are using it to simulate email processing.

For example, imagine our application is sending an email and needs some time to complete the operation.

**Note:** This is only a simulation. No actual email is being sent in this project.

**4. Redis Connection**

```js
{ connection }
```

Provides the Redis connection settings to our Worker.

## 15. Completed Event

```js
worker.on('completed', (job) => {
    console.log(
        "Job Completed!",
        job.id,
        job.name,
        job.data
    );
});
```

**Purpose:** Detects when a job has been processed successfully.

- `worker.on()`: Listens for an event.
- `'completed'`: Event triggered when a job completes successfully.
- `job`: Contains information about the completed job.

When the job finishes successfully, this event runs.

## 16. Failed Event

```js
worker.on('failed', (job, err) => {
    console.log(
        "Job Failed!",
        job?.id,
        job?.name,
        job?.data,
        err
    );
});
```

**Purpose:** Detects when a job fails during processing.

- `'failed'`: Event triggered when a job processing attempt fails.
- `job`: Contains information about the failed job.
- `err`: Contains the error that caused the failure.
- `job?.id`: Safely accesses the job ID if the job object exists.

**Important:** If a job fails but has remaining attempts, BullMQ can retry it. The failed event can run for an attempt even if a later retry succeeds.

---

# Part 4: Understanding the Complete Flow

## 17. How Everything Works Together

1. A user submits their information to `/welcome-email`.
2. `index.js` receives the request.
3. `emailQueue.add()` creates a welcome email job.
4. The job is added to the `emails` queue in Redis.
5. `index.js` sends a response to the user.
6. The Worker in `worker.js` picks up the job.
7. The Worker processes the job.
8. If processing succeeds, the `completed` event runs.
9. If processing fails, BullMQ checks the retry settings.
10. If attempts remain, BullMQ retries the job according to the backoff settings.
11. If all attempts fail, the job remains in the failed state.

## 18. Understanding Job States

BullMQ manages jobs through different states.

| Job State | Meaning |
|---|---|
| Waiting | Job is waiting to be processed. |
| Active | Worker is currently processing the job. |
| Delayed | Job is waiting for its retry or scheduled processing time. |
| Completed | Job was processed successfully. |
| Failed | Job could not be processed successfully after its available attempts. |

## 19. How to Test the Project

### Step 1: Start Redis

Make sure your Redis server is running on:

```text
localhost:6379
```

### Step 2: Start the Worker

Open your first terminal:

```bash
node worker.js
```

The Worker will start listening for jobs.

### Step 3: Start the Express Server

Open another terminal:

```bash
node index.js
```

Your API will start on port `3000`.

### Step 4: Send a POST Request

**Method:** POST

**URL:**

```http
http://localhost:3000/welcome-email
```

**JSON Body:**

```json
{
    "to": "user@example.com",
    "name": "Habib"
}
```

**Expected API Response:**

```json
{
    "message": "Welcome email job added to the queue!",
    "job": {
        "id": "1",
        "name": "send-welcome-email",
        "data": {
            "to": "user@example.com",
            "name": "Habib"
        }
    }
}
```

The job ID is an example. BullMQ generates the actual ID.

### Step 5: Check Worker Terminal

You should see something like:

```text
Processing email job... 1 send-welcome-email ...

Email job Completed 1 send-welcome-email ...

Job Completed! 1 send-welcome-email ...
```

This means our Worker successfully processed the job.

---

# 20. Important Concepts to Remember

| Concept | Purpose |
|---|---|
| BullMQ | Manages background jobs using Redis. |
| Queue | Holds jobs waiting to be processed. |
| Worker | Picks up and processes jobs. |
| `Queue` | Creates a queue. |
| `Worker` | Creates a job processor. |
| `emailQueue.add()` | Adds a new job to the queue. |
| `job.id` | Identifies a job. |
| `job.name` | Identifies the type of job. |
| `job.data` | Contains the job information. |
| `attempts` | Defines the maximum total processing attempts. |
| `backoff` | Controls the waiting time before retries. |
| `exponential` | Increases the waiting time after each failure. |
| `completed` | Detects successfully processed jobs. |
| `failed` | Detects failed processing attempts. |

## 21. Notes Summary

**BullMQ:** A Node.js library that uses Redis to manage background jobs and process them using Workers.

**Main purpose:** To move time-consuming tasks away from API requests and process them separately in the background.

**Remember:**

- Queue adds jobs.
- Worker processes jobs.
- Redis stores the queue information.
- `attempts` controls how many times BullMQ tries a job.
- `backoff` controls how long BullMQ waits before retrying.
- `completed` detects successful processing.
- `failed` detects unsuccessful processing.

**Main takeaway:** BullMQ allows our application to add jobs to a queue and process them separately using Workers. It also provides automatic retries when jobs fail.