# What is Redis?

Redis is a fast, in-memory data storage system that stores data in your computer's memory (RAM) so applications can access it very quickly.

In simple words, Redis works like a temporary storage area where your application can save and quickly retrieve frequently used data.

# Why do we use Redis?

# We use Redis to:

1. Improve speed: Retrieve data much faster without repeatedly querying the main database.
2. Store temporary data: Keep information that doesn't need to be stored permanently.
3. Reduce database work: Avoid sending the same requests to the main database again and again.
4. Manage user sessions: Temporarily store information about logged-in users.
5. Cache data: Save frequently requested data so it loads faster next time.
   Simple example
   Imagine you have an online academy website.

When a user opens the homepage, your application fetches the list of courses from PostgreSQL.

# Without Redis:

- Every visitor requests the course list from PostgreSQL.
- The database has to process the same request repeatedly.
  With Redis:
- Your application fetches the courses from PostgreSQL once.
- It stores the result in Redis.
- The next visitors can get the course list directly from Redis, much faster.
  How it works
  User requests course list

# How Redis Works

Redis checks for cached data

If the data exists, return it quickly.

If data is not available, fetch it from PostgreSQL and store it in Redis.

# Redis vs Database

# Redis

Very fast data access
Mainly stores data in RAM
Often used for temporary data
Can lose data depending on its configuration

# PostgreSQL

Permanent data storage
Stores data on disk
Used for important application data
Designed for reliable long-term storage

# Notes summary

Redis: Redis is a fast, in-memory data storage system used to temporarily store frequently accessed data, manage user sessions, and reduce repeated database requests.

Main purpose: To make applications faster and reduce the workload on the main database.

Remember: Redis does not normally replace your main database. It works alongside it.
