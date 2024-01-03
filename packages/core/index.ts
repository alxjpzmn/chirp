import db from "@db/init";
import runMigrationQueries from "@db/migrate";
import router from "@router/index";
import queueConnection from "@util/misc/queueConnection";
import { Queue } from "bullmq";
import OpenAI from "openai";

try {
  runMigrationQueries();
  db.exec("PRAGMA journal_mode = WAL;");
  console.log("db migrated");

  const testQueue = new Queue("test", { connection: queueConnection });
  testQueue ? console.log("redis connection up") : null;

  const pathToFfmpeg = require("ffmpeg-static");
  const pathToFfprobe = require("ffprobe-static");
  const ffmpeg = require("fluent-ffmpeg");
  ffmpeg.setFfmpegPath(pathToFfmpeg);
  ffmpeg.setFfprobePath(pathToFfprobe.path);
  const command = ffmpeg();

  command ? console.log("ffmpeg loaded") : null;

  const openai = new OpenAI();
  openai ? console.log("openai sdk loaded") : null;
} catch (e) {
  console.log(e);
}

router();
