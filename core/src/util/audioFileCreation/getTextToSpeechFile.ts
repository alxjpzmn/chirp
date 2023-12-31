import textchunk from "textchunk";
import OpenAI from "openai";
import { rm } from "node:fs/promises";
import createFolderIfNotExists from "@util/misc/createFolderIfNotExits";
import getBasePath from "@util/misc/getBasePath";
import {
  FILE_FOLDER_NAME,
  FINISHED_RECORDINGS_RELATIVE_PATH,
  TEMP_RECORDINGS_RELATIVE_PATH,
} from "@util/misc/constants";

const getTextToSpeechFile = async (id: number, text: string) => {
  try {
    const pathToFfmpeg = require("ffmpeg-static");
    const pathToFfprobe = require("ffprobe-static");
    const ffmpeg = require("fluent-ffmpeg");
    ffmpeg.setFfmpegPath(pathToFfmpeg);
    ffmpeg.setFfprobePath(pathToFfprobe.path);
    const command = ffmpeg();

    const textBatches: string[] = textchunk.chunk(text, 4000);

    const openai = new OpenAI();
    const basePath = getBasePath();
    createFolderIfNotExists(`${basePath}/${FILE_FOLDER_NAME}`);
    createFolderIfNotExists(`${basePath}/${TEMP_RECORDINGS_RELATIVE_PATH}`);
    createFolderIfNotExists(`${basePath}/${FINISHED_RECORDINGS_RELATIVE_PATH}`);
    createFolderIfNotExists(
      `${basePath}/${TEMP_RECORDINGS_RELATIVE_PATH}/${id}`,
    );
    let i = 0;
    for (const batch of textBatches) {
      const speechFilePath = `${basePath}/${TEMP_RECORDINGS_RELATIVE_PATH}/${id}/tts-${i}.mp3`;
      const mp3 = await openai.audio.speech.create({
        model: "tts-1-hd",
        voice: "alloy",
        input: batch,
      });
      const buffer = Buffer.from(await mp3.arrayBuffer());
      await Bun.write(speechFilePath, buffer);
      command.input(speechFilePath);
      i++;
    }
    const outputFile = `${basePath}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${id}.mp3`;
    const promisifiedFileCreation = () =>
      new Promise((resolve, reject) =>
        command
          .mergeToFile(outputFile)
          .on("end", async () => {
            await rm(`${basePath}/${TEMP_RECORDINGS_RELATIVE_PATH}/${id}`, {
              recursive: true,
            });
            resolve();
          })
          .on("error", (err: any) => {
            reject(new Error(`Merging audio files failed: ${err}`));
          }),
      );
    await promisifiedFileCreation();
  } catch (error) {
    console.error(error);
  }
};

export default getTextToSpeechFile;
