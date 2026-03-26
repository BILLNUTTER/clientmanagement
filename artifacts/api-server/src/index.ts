import { createServer } from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { initDb } from "./lib/db";
import { runMigrations } from "./lib/migrate";
import { initSocket } from "./socket";

const rawPort = process.env["PORT"] ?? "10000";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);
const io = initSocket(httpServer);

(app as any).io = io;

async function start() {
  initDb();
  await runMigrations();

  const { seedData } = await import("./routes/nutterx/seed");
  await seedData();

  httpServer.listen(port, () => {
    logger.info({ port }, "Server listening with Socket.io");
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
