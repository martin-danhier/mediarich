import express from 'express';

// Create a new express app instance
const app: express.Application = express();

app.get('/', (req, res) => {
    res.send('Ok');
});

app.listen(process.env.SERVER_PORT, function () {
    console.log(`App is listening on port ${process.env.SERVER_PORT}!`);
});