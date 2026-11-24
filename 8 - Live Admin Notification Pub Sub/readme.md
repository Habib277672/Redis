# Redis Pub/Sub (Publish/Subscribe) with Node.js & Express

## 1. What is Redis Pub/Sub?

Pub/Sub stands for **Publish/Subscribe**.

It is a Redis feature that allows one application to send messages to a channel, while other applications listen to that channel and receive messages.

In simple words:

- **Publisher:** Sends messages.
- **Subscriber:** Receives messages.
- **Channel:** The place where messages are published and received.

### Simple Example

Imagine you have an online academy website.

Whenever the admin publishes a new announcement, you want all currently connected users to receive that notification.

You can use Redis Pub/Sub:

1. Admin creates a notification.
2. Publisher sends the notification to a Redis channel.
3. All subscribers listening to that channel receive the notification.
4. Each subscriber can display the notification to its users.

**Main purpose:** To send messages from one part of an application to multiple listening parts in real time.

## 2. Understanding the Three Main Concepts

### 1. Publisher

The Publisher sends messages to a Redis channel.

For example, our Express application acts as the Publisher.

### 2. Subscriber

The Subscriber listens to a Redis channel and receives messages whenever someone publishes something to it.

For example, another application or server can listen for notifications.

### 3. Channel

A Channel is the name used to organize messages.

For example:

```text
notifications
```

The Publisher sends messages to this channel, and Subscribers listen to the same channel.

### How It Works

```text
             Publisher
                 |
                 |
       Publishes a Message
                 |
                 ▼
          Redis Channel
          notifications
                 |
          ┌──────┴──────┐
          ▼             ▼
      Subscriber 1  Subscriber 2
          |             |
          ▼             ▼
      Receives       Receives
      Message        Message
```

**Remember:** One Publisher can send a message to multiple Subscribers through the same channel.

## 3. Understanding Our Project Structure

We have two main files:

```text
project/
│
├── index.js
├── subscriber.js
├── .env
└── package.json
```

| File            | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `index.js`      | Creates the Publisher and sends notifications.        |
| `subscriber.js` | Creates the Subscriber and listens for notifications. |

## 4. Install Required Packages

Run this command:

```bash
npm install express ioredis dotenv
```

Make sure Redis is running on your computer.

Also, make sure your `package.json` includes:

```json
{
  "type": "module"
}
```

## Part 1: Publisher Setup (index.js)

### 5. Import Packages

```js
import "dotenv/config";
import express from "express";
import Redis from "ioredis";
```

- `dotenv`: Loads environment variables from the `.env` file.
- `express`: Creates our backend server and API routes.
- `ioredis`: Connects our Node.js application with Redis.

### 6. Initialize Express

```js
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
```

- `express()`: Creates our Express application.
- `PORT`: Defines the port on which our server runs.
- `express.json()`: Allows our application to receive and read JSON request data.

### 7. Connect Publisher with Redis

```js
const publisher = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
```

**Purpose:** Creates a Redis connection that we will use to publish messages.

- `new Redis()`: Creates a Redis connection.
- `process.env.REDIS_URL`: Gets the Redis URL from the `.env` file.
- `redis://localhost:6379`: Default local Redis connection.

**Remember:** Our Publisher uses this connection to send messages to Redis channels.

### 8. POST – Publish a Notification

```js
app.post("/notifications", async (req, res) => {
  const payload = {
    title: req.body.title || "Default Value",
    createdAt: new Date().toISOString(),
  };

  const receivers = await publisher.publish(
    "notifications",
    JSON.stringify(payload),
  );

  res.json({
    message: `Notification sent to ${receivers} subscribers`,
  });
});
```

**Purpose:** Receives a notification and publishes it to the `notifications` channel.

Let's understand each part.

**1. Create a Notification Object**

```js
const payload = {
  title: req.body.title || "Default Value",
  createdAt: new Date().toISOString(),
};
```

Creates an object containing notification information.

- `title`: Notification message or title.
- `createdAt`: Date and time when the notification was created.
- `"Default Value"`: Used when the user does not provide a title.

**2. Publish the Message**

```js
const receivers = await publisher.publish(
  "notifications",
  JSON.stringify(payload),
);
```

This is the most important part.

`publisher.publish()` sends a message to a Redis channel.

It accepts two main arguments:

First argument:

```js
"notifications";
```

This is the channel name where we want to send the message.

Second argument:

```js
JSON.stringify(payload);
```

Converts our JavaScript object into a JSON string because we are publishing it as a message.

**3. Understand the Receivers Variable**

```js
const receivers = await publisher.publish(...);
```

Redis returns the number of subscribers that received the published message.

For example:

- If 1 subscriber is listening, it returns `1`.
- If 3 subscribers are listening, it returns `3`.
- If nobody is listening, it returns `0`.

**Important:** This number represents subscribers that received the message, not individual people using your website.

**4. Send Response**

```js
res.json({
  message: `Notification sent to ${receivers} subscribers`,
});
```

Sends a response showing how many subscribers received the notification.

### Example API Request

**Method:** POST

**URL:**

```http
http://localhost:3000/notifications
```

**JSON Body:**

```json
{
  "title": "New course is available!"
}
```

**Expected Response (with one active subscriber):**

```json
{
  "message": "Notification sent to 1 subscribers"
}
```

## Part 2: Subscriber Setup (subscriber.js)

### 9. Import Redis

```js
import "dotenv/config";
import Redis from "ioredis";
```

- `dotenv`: Loads environment variables.
- `ioredis`: Allows our application to connect and communicate with Redis.

**Note:** We load `dotenv/config` here as well because the Subscriber runs in a separate Node.js process.

### 10. Create Subscriber Connection

```js
const subscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
```

Creates a separate Redis connection for our Subscriber.

**Remember:** We use a separate Redis client for subscribing because a connection in subscription mode is dedicated to Pub/Sub operations.

### 11. Subscribe to a Channel

```js
subscriber.subscribe("notifications", (err) => {
  if (err) {
    console.log("Failed to Subscribe", err.message);
    return;
  }

  console.log("Subscribed Successfully :)");
});
```

**Purpose:** Tells Redis that our application wants to listen to the `notifications` channel.

Let's understand it.

**1. Subscribe to Channel**

```js
subscriber.subscribe("notifications");
```

`subscribe()` tells Redis which channel we want to listen to.

Here, we are listening to:

```text
notifications
```

**2. Check Subscription Status**

```js
(err) => {
  if (err) {
    console.log("Failed to Subscribe", err.message);
    return;
  }

  console.log("Subscribed Successfully :)");
};
```

This callback runs after Redis responds to the subscription request.

- If an error occurs, it displays the error.
- If everything works, it displays a success message.

## 12. Listen for Incoming Messages

```js
subscriber.on("message", (channel, message) => {
  console.log("Received on", channel, ":", JSON.parse(message));
});
```

**Purpose:** Receives and displays messages published to the subscribed channel.

### Explanation

`subscriber.on()` listens for Redis events.

Here:

```js
"message";
```

This event runs whenever a message is received on a subscribed channel.

It provides two important values:

**1. Channel**

```js
channel;
```

Contains the name of the channel where the message was published.

Example:

```text
notifications
```

**2. Message**

```js
message;
```

Contains the actual message sent by the Publisher.

**3. Convert JSON String into an Object**

```js
JSON.parse(message);
```

Our Publisher used `JSON.stringify()` before sending the message.

Now the Subscriber uses `JSON.parse()` to convert that JSON string back into a JavaScript object.

### Example Subscriber Output

```text
Subscribed Successfully :)

Received on notifications : {
    title: 'New course is available!',
    createdAt: '2026-11-24T12:00:00.000Z'
}
```

## Part 3: Testing Pub/Sub

### 13. Start Redis

Make sure your Redis server is running on:

```text
localhost:6379
```

### 14. Start Subscriber First

Open your first terminal:

```bash
node subscriber.js
```

Expected output:

```text
Subscribed Successfully :)
```

**Important:** Start the Subscriber before publishing notifications so it is already listening.

### 15. Start Express Server

Open another terminal:

```bash
node index.js
```

Expected output:

```text
Your App is Running on Port: 3000
```

### 16. Send Notification Using Postman

**Method:** POST

**URL:**

```http
http://localhost:3000/notifications
```

**JSON Body:**

```json
{
  "title": "Welcome to our Academy!"
}
```

Expected API response:

```json
{
  "message": "Notification sent to 1 subscribers"
}
```

Now check your Subscriber terminal.

You should see:

```text
Received on notifications : {
    title: 'Welcome to our Academy!',
    createdAt: '2026-11-24T12:00:00.000Z'
}
```

If you start two or more subscriber processes, all of them listening to the same channel will receive the notification.

## 17. Important Redis Pub/Sub Methods

| Method                     | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `publisher.publish()`      | Sends a message to a Redis channel.         |
| `subscriber.subscribe()`   | Starts listening to a Redis channel.        |
| `subscriber.on('message')` | Receives messages from subscribed channels. |
| `JSON.stringify()`         | Converts an object into a JSON string.      |
| `JSON.parse()`             | Converts a JSON string back into an object. |

## 18. Important Things to Remember

- Publisher sends messages.
- Subscriber receives messages.
- Channel connects Publishers and Subscribers.
- `publish()` sends messages to a channel.
- `subscribe()` listens to a channel.
- Multiple Subscribers can listen to the same channel.
- Every currently subscribed client receives the published message.
- `publish()` returns the number of subscribers that received the message.

### Important: Pub/Sub Does Not Store Messages

Redis Pub/Sub is designed for real-time message delivery.

It does not save messages for Subscribers that are offline.

For example:

- Publisher sends a notification.
- Subscriber is not running at that time.
- The notification is published but the Subscriber does not receive it.
- When the Subscriber starts again, it does not automatically receive the old notification.

**Remember:** Pub/Sub sends messages to currently connected Subscribers. It is not a permanent storage system or a job queue.

## 19. Redis Pub/Sub vs BullMQ Queue

Both are used to communicate or manage work, but they serve different purposes.

| Redis Pub/Sub                                  | BullMQ                                                         |
| ---------------------------------------------- | -------------------------------------------------------------- |
| Sends messages to Subscribers.                 | Stores jobs in a queue.                                        |
| Designed for real-time communication.          | Designed for background job processing.                        |
| Offline Subscribers miss messages.             | Waiting jobs can be processed when a Worker becomes available. |
| Multiple Subscribers receive the same message. | Workers process jobs from a queue.                             |
| Does not provide job retries.                  | Supports automatic job retries.                                |

### When Should We Use Pub/Sub?

Use Pub/Sub when you want to:

- Send real-time notifications.
- Broadcast messages to multiple services.
- Send live updates.
- Notify connected applications about new events.

### When Should We Use BullMQ?

Use BullMQ when you want to:

- Send emails in the background.
- Process jobs one by one.
- Retry failed jobs.
- Schedule background tasks.
- Make sure waiting jobs are not simply missed when Workers are offline.

## 20. Notes Summary

**Redis Pub/Sub:** A Redis feature that allows a Publisher to send messages to a channel and multiple Subscribers to receive those messages in real time.

**Main purpose:** To send real-time messages between different parts of an application.

**Remember:**

- Publisher = Sends messages.
- Subscriber = Receives messages.
- Channel = Where messages are published.
- `publish()` = Sends a message.
- `subscribe()` = Listens to a channel.
- `message` event = Handles incoming messages.

**Main takeaway:** Redis Pub/Sub allows one Publisher to broadcast a message to multiple Subscribers at the same time, without storing the messages for later delivery.
