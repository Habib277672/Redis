import "dotenv/config";
import express from "express";
import { emailQueue } from "./queue.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/welcome-email", async (req, res) => {
    const job = emailQueue.add(
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
    res.json({ message: "Welcome email job added to the queue!" }, job.id, job.name, job.data)
});

app.listen(PORT, () => {
    console.log("Your App is Running on Port :", PORT);
});
