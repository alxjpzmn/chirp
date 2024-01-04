import getTextToSpeechFile from "@util/audioFileCreation/getTextToSpeechFile";
import { Queue, Worker } from "bullmq";
import queueConnection from "@util/misc/queueConnection";

export interface AudioInputData {
  id: number;
  text: string;
  title: string;
  slug: string;
}

class GetAudioQueue {
  name: string;
  queue: Queue;
  public events: Worker;
  constructor() {
    this.name = "get_audio";
    this.queue = new Queue(this.name, { connection: queueConnection });
    this.events = new Worker(
      this.name,
      async (job) => {
        await getTextToSpeechFile(job.data.id, job.data.text);
      },
      { connection: queueConnection },
    );
  }
  public add(data: AudioInputData) {
    this.queue.add(this.name, data);
  }
}

export default GetAudioQueue;
