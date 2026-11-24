import "dotenv/config";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const publisher = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.post('/notificaions', async (req, res) => {
    const payload = {
        title: req.body.title || "Default Value",
        createdAt: new Date().toISOString(),
    }
    const receivers = await publisher.publish('notifications', JSON.stringify(payload));
    res.json({ message: `Notification Send to ${receivers} subscribers` });
})

app.listen(PORT, () => {
    console.log("Your App is Running on Port :", PORT);
});
