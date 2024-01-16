import OpenAI from "openai";
import { rm } from "node:fs/promises";
import createFolderIfNotExists from "@util/misc/createFolderIfNotExits";
import getDataDirPath from "@util/misc/getDataDirPath";
import {
  FINISHED_RECORDINGS_RELATIVE_PATH,
  TEMP_RECORDINGS_RELATIVE_PATH,
} from "@util/misc/constants";
import chunk from "chunk-text";
import ffmpegInstance from "./initFfmpeg";
import db from "@db/init";

const getTextToSpeechFile = async (id: number, text: string) => {
  try {
    const retry = require("async").retry;

    const command = ffmpegInstance();

    // OpenAI's character limit per request
    const textFragments: string[] = chunk(text, 4096);
    const basePath = getDataDirPath();
    createFolderIfNotExists(
      `${basePath}/${TEMP_RECORDINGS_RELATIVE_PATH}/${id}`,
    );

    let i = 0;
    for (const textFragment of textFragments) {
      const openai = new OpenAI();
      const speechFilePath = `${basePath}/${TEMP_RECORDINGS_RELATIVE_PATH}/${id}/tts-${i}.mp3`;
      const mp3 = await retry(
        { times: 3, interval: 20000 },
        async () =>
          await openai.audio.speech.create({
            model: "tts-1-hd",
            voice: "alloy",
            input: textFragment,
          }),
      );

      const buffer = Buffer.from(await mp3.arrayBuffer());

      await Bun.write(speechFilePath, buffer);
      command.mergeAdd(speechFilePath);
      i++;
    }

    createFolderIfNotExists(`${basePath}/${FINISHED_RECORDINGS_RELATIVE_PATH}`);
    const outputFile = `${basePath}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${id}.mp3`;
    const promisifiedFileCreation = () =>
      new Promise((resolve, reject) =>
        command
          .mergeToFile(
            outputFile,
            `${basePath}/${TEMP_RECORDINGS_RELATIVE_PATH}/${id}`,
          )
          .on("end", async () => {
            await rm(`${basePath}/${TEMP_RECORDINGS_RELATIVE_PATH}/${id}`, {
              recursive: true,
            });
            resolve(true);
          })
          .on("error", async (err: any) => {
            await rm(`${basePath}/${TEMP_RECORDINGS_RELATIVE_PATH}/${id}`, {
              recursive: true,
            });
            reject(new Error(`Merging audio files failed: ${err}`));
          }),
      );
    await promisifiedFileCreation();
    const update_transcript_query = db.query(
      "UPDATE transcripts SET updated_at = $updated_at WHERE id = $id",
    );

    update_transcript_query.run({
      $updated_at: new Date().toISOString(),
      $id: id,
    });
  } catch (e) {
    console.error(e);
    throw new Error(`${e}`);
  }
};

export default getTextToSpeechFile;
