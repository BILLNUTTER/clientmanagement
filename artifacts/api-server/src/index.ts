import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { connectDB } from "./lib/db";
import { initSocket } from "./socket";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);
const io = initSocket(httpServer);

(app as any).io = io;

connectDB()
  .then(async () => {
    const { seedData } = await import("./routes/nutterx/seed");
    await seedData();
    httpServer.listen(port, () => {
      logger.info({ port }, "Server listening with Socket.io");
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to connect to MongoDB, exiting");
    process.exit(1);
  });
