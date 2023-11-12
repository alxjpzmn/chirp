// @ts-ignore
import textchunk from "textchunk";
import OpenAI from "openai";
// import fs from "fs";
import path from "path";

const getTextToSpeechFile = async (text: string, jobId: number) => {
  const pathToFfmpeg = require("ffmpeg-static");
  const pathToFfprobe = require("ffprobe-static");
  console.log(pathToFfprobe);
  console.log(pathToFfmpeg);
  const ffmpeg = require("fluent-ffmpeg");
  ffmpeg.setFfmpegPath(pathToFfmpeg);
  ffmpeg.setFfprobePath(pathToFfprobe.path);
  // Create a new FFmpeg command
  const command = ffmpeg();

  const textBatches: string[] = textchunk.chunk(text, 4000);
  const openai = new OpenAI();

  let i = 0;
  for (const batch of textBatches) {
    const basePath = path.resolve(".");
    console.log(basePath);

    const speechFilePath = `${basePath}/tts-${i}.mp3`;
    console.log(speechFilePath);

    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: batch,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await Bun.write(speechFilePath, buffer);
    i++;
    command.input(speechFilePath);
  }
  const outputFile = "output.mp3";
  command
    .mergeToFile(outputFile)
    .on("end", () => {
      console.log("Concatenation finished");
    })
    .on("error", (err: any) => {
      console.error("Error:", err);
    });
  // await fs.promises.rmdir(`./tempFiles/${jobId}`);
};

export default getTextToSpeechFile;
