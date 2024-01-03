import extractArticleText from "@util/textExtraction/extractArticleText";
import { Queue, Worker } from "bullmq";
import queueConnection from "@util/misc/queueConnection";

export interface ArticleInputData {
  url: string;
}

export interface ExtractTextQueueJob {
  type: "article";
  payload: ArticleInputData;
}

class ExtractTextQueue {
  name: string;
  queue: Queue;
  public events: Worker;
  constructor() {
    this.name = "extract_text";
    this.queue = new Queue(this.name, { connection: queueConnection });
    this.events = new Worker(
      this.name,
      async (job) => {
        await extractArticleText(job.data.payload.url);
      },
      { connection: queueConnection },
    );
  }
  public add(data: ExtractTextQueueJob) {
    this.queue.add(this.name, data);
  }
}

export default ExtractTextQueue;
