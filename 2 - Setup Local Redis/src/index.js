import 'dotenv/config'
import express from 'express'
import Redis from 'ioredis'
import mongoose, { mongo } from 'mongoose'


const app = express();
const PORT = process.env.PORT || 3000;

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const URL = process.env.MONOG_URL || 'mongodb://localhost:27017/redis_practice'

app.get("/redis", async (req, res) => {
    const reply = await redis.ping();
    res.json({ redis: reply })
})

app.get("/mongo", async (req, res) => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(URL)
    }
    res.json({ mongo: "connected", database: mongoose.connection.name })
})

app.listen(PORT, () => {
    console.log("Your App is Running on Port : ", PORT)
})