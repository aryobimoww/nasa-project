const app = require("./app");
require("dotenv").config();
const PORT = process.env.PORT || 8000;
const http = require("http");
const { loadPlanetsData } = require("./models/planets.model");
const { loadLauchData } = require("./models/launches.model");
const server = http.createServer(app);
const { mongoConnection } = require("./services/mongo");

async function startServer() {
  await mongoConnection();
  await loadPlanetsData();
  await loadLauchData();
  server.listen(PORT, () => {
    console.log(`listening on port ${PORT}...`);
  });
}
startServer();
