import 'dotenv/config'
import express from 'express'
import Redis from 'ioredis'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

function otpKey(phone) {
    return `opt:${phone}`
}

app.post('/otp', async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(10000 + Math.random() * 900000).toString();

    await redis.set(otpKey(phone), otp, 'EX', 30); //OTP valid for 30 seconds
    res.json({ message: "OTP Sent", otp });
})

app.post('/otp/verify', async (req, res) => {
    const { phone, otp } = req.body;
    const savedOtp = await redis.get(otpKey(phone));

    if (!savedOtp) {
        return res.status(400).json({ message: "OTP Expired or Not Found" });
    }

    if (savedOtp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    await redis.del(otpKey(phone));
    res.json({ message: "OTP Verfiend Successfully" })
})

app.get('/otp/:phone/ttl', async (req, res) => {
    const ttl = await redis.ttl(otpKey(req.params.phone))
    res.json({ ttl })
})

app.listen(PORT, () => {
    console.log("Your App is Running on Port : ", PORT)
})