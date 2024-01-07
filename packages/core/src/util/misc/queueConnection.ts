import { ConnectionOptions } from "bullmq";
import { env } from "process";
const queueConnection: ConnectionOptions = {
  host: env.REDIS_URL ?? "localhost",
  port: parseInt(env.REDIS_PORT ?? "6379"),
};

export default queueConnection;
