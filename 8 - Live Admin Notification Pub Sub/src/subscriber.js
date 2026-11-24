import Redis from 'ioredis';

const subscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

subscriber.subscribe('notifications', (err) => {
    if (err) {
        console.log("Failed to Subscribe", err.message)
        return;
    }
    console.log("Subcribed Successfully :)")
});

subscriber.on('message', (channel, message) => {
    console.log("Recevied on", channel, ":", JSON.parse(message))
})