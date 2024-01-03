import router from "@router/index";
import queueConnection from "@util/misc/queueConnection";
import { Queue } from "bullmq";
import OpenAI from "openai";

try {
  const testQueue = new Queue("test", { connection: queueConnection });

  const pathToFfmpeg = require("ffmpeg-static");
  const pathToFfprobe = require("ffprobe-static");
  const ffmpeg = require("fluent-ffmpeg");
  ffmpeg.setFfmpegPath(pathToFfmpeg);
  ffmpeg.setFfprobePath(pathToFfprobe.path);
  const command = ffmpeg();
  console.log(command);

  const openai = new OpenAI();
} catch (e) {
  console.log(e);
}

router();
