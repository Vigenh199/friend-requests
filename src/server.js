const http = require('http');

const { connectToMongo } = require('./services/mongo');
const app = require('./app');

const PORT = process.env.PORT;
const server = http.createServer(app);

async function startServer() {
  await connectToMongo();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
};

startServer();
