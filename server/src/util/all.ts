import { Readability, isProbablyReaderable } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import { normalizeWhiteSpaces } from "normalize-text";
//@ts-ignore
import textchunk from "textchunk";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { Queue } from "bullmq";
import { Worker } from "bullmq";
import { QueueEvents } from "bullmq";

const all = async () => {
  const rawResponse = await fetch(
    "https://www.economist.com/finance-and-economics/2023/11/09/why-american-manufacturing-is-increasingly-inefficient",
  );
  if (rawResponse.status !== 200) {
    throw new Error(
      `Error getting input source, HTTP status code: ${rawResponse?.status}.`,
    );
  }

  const queue = new Queue("Paint");

  queue.add("cars", { color: "blue" });

  new Worker("Paint", async (job) => {
    if (job.name === "cars") {
      console.log("processing job");
    }
  });

  const queueEvents = new QueueEvents("Paint");

  queueEvents.on("completed", ({ jobId }) => {
    console.log(jobId);

    console.log("done painting");
  });

  const DOMWindow = new JSDOM("").window;
  const DOMPurify = createDOMPurify(DOMWindow);
  const rawhtml = await rawResponse.text();
  const sanitizedHtml = DOMPurify.sanitize(rawhtml);
  const interpretedHtml = new JSDOM(sanitizedHtml);
  const document = interpretedHtml?.window?.document;
  const reader = new Readability(document);

  if (!isProbablyReaderable(document)) {
    throw new Error("Probably not readerable.");
  }

  const article = reader.parse();

  if (!article || !article.textContent) {
    throw new Error("Not a valid article.");
  }

  const textContent = normalizeWhiteSpaces(article?.textContent);

  console.log(textContent);

  const pathToFfmpeg = require("ffmpeg-static");
  const pathToFfprobe = require("ffprobe-static");
  console.log(pathToFfprobe);
  console.log(pathToFfmpeg);
  const ffmpeg = require("fluent-ffmpeg");
  ffmpeg.setFfmpegPath(pathToFfmpeg);
  ffmpeg.setFfprobePath(pathToFfprobe.path);
  // Create a new FFmpeg command
  const command = ffmpeg();

  const textBatches: string[] = textchunk.chunk(textContent.slice(0, 10), 4000);
  const openai = new OpenAI();

  let i = 0;
  for (const batch of textBatches) {
    console.log(batch);
    const speechFile = path.resolve(`./speech-${i}.mp3`);
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: batch,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    i++;
    command.input(speechFile);
  }
  // Output file
  const outputFile = "output.mp3";
  // Set the output file and concatenate the inputs
  command
    .mergeToFile(outputFile)
    .on("end", () => {
      console.log("Concatenation finished");
    })
    .on("error", (err: any) => {
      console.error("Error:", err);
    });
  return new Response("Bun!");
};

export default all;
