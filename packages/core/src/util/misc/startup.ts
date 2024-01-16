import db from "@db/init";
import runMigrationQueries from "@db/migrate";
import ffmpegInstance from "@util/audioFileCreation/initFfmpeg";
import queueConnection from "@util/misc/queueConnection";
import { ConnectionOptions, Queue } from "bullmq";
import OpenAI from "openai";

const testRedisConnection = () => {
  const testQueue = new Queue("test", {
    connection: {
      ...(queueConnection as Partial<ConnectionOptions>),
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
    },
  });
  console.info("Redis connection established.");
  testQueue.close();
};

const checkForFFMPEG = () => {
  const ffmpeg = ffmpegInstance() as any;

  if (!!ffmpeg) {
    console.info("FFmpeg loaded.");
  } else {
    throw new Error("FFmpeg couldn't be initialized.");
  }
};

const checkForOpenAi = () => {
  const openai = new OpenAI();
  if (!!openai) {
    console.info("OpenAI SDK initialized.");
  } else {
    throw new Error("OpenAI SDK couldn't be initialized.");
  }
};

const startup = () => {
  runMigrationQueries();
  db.exec("PRAGMA journal_mode = WAL;");
  testRedisConnection();
  checkForFFMPEG();
  checkForOpenAi();
};

export default startup;
