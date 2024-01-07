import { parseBuffer } from "music-metadata";
import { stat } from "node:fs/promises";

const getAudioMetadata = async (filePath: string) => {
  const file = Bun.file(filePath);
  const arrbuf = await file.arrayBuffer();
  const buffer = Buffer.from(arrbuf);

  const metadata = await parseBuffer(buffer, "audio/mpeg");

  const fileSize = await stat(filePath);
  return {
    length: metadata.format.duration,
    size: fileSize?.size,
  };
};

export default getAudioMetadata;
