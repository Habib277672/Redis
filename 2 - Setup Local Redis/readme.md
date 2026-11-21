# Redis Setup with Node.js, Express & MongoDB

A simple practice project to learn how to connect **Redis** and **MongoDB** with a Node.js and Express application.

The project includes basic API endpoints to check whether Redis and MongoDB are successfully connected.

## Tech Stack

- **Node.js** – JavaScript runtime.
- **Express.js** – Backend framework for creating API routes.
- **Redis** – Fast, in-memory data storage.
- **ioredis** – Package used to connect Redis with Node.js.
- **MongoDB** – NoSQL database.
- **Mongoose** – Package used to connect and interact with MongoDB.
- **dotenv** – Loads environment variables from a `.env` file.

## 1. Installation

Clone the repository or open your project directory.

Install the required dependencies:

```bash
npm install express ioredis mongoose dotenv
```

## 2. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000

REDIS_URL=redis://localhost:6379

MONGO_URL=mongodb://localhost:27017/redis_practice
```

### Environment Variables Explained

| Variable    | Description                            |
| ----------- | -------------------------------------- |
| `PORT`      | Port on which the Express server runs. |
| `REDIS_URL` | Redis server connection URL.           |
| `MONGO_URL` | MongoDB connection URL.                |

**Note:** Make sure Redis and MongoDB are installed and running before starting the application.

## 3. Start the Application

Run the following command:

```bash
node server.js
```

Replace `server.js` with your actual entry file name if it is different.

Your server will start on:

```text
http://localhost:3000
```

## 4. API Endpoints

### Check Redis Connection

**Endpoint:**

```http
GET /redis
```

Checks whether the application can communicate with the Redis server using `redis.ping()`.

**Expected Response:**

```json
{
  "redis": "PONG"
}
```

`PONG` means Redis successfully responded.

### Check MongoDB Connection

**Endpoint:**

```http
GET /mongo
```

Checks the MongoDB connection and returns the connected database name.

**Expected Response:**

```json
{
  "mongo": "connected",
  "database": "redis_practice"
}
```

## 5. Test the Application

After starting the server, open these URLs in your browser or API testing tool:

| URL                           | Purpose                  |
| ----------------------------- | ------------------------ |
| `http://localhost:3000/redis` | Test Redis connection.   |
| `http://localhost:3000/mongo` | Test MongoDB connection. |

## Project Learning Goals

- Understand what Redis is and why we use it.
- Learn how to connect Redis with Node.js using `ioredis`.
- Learn how to check a Redis connection using `ping()`.
- Understand how Redis and MongoDB work alongside a backend application.
- Practice connecting multiple data services to an Express server.

---

**Note:** This is a basic Redis and MongoDB connection practice project. It focuses on setting up connections and checking their status. It does not yet implement caching or storing application data in Redis.
