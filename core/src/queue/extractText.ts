import extractArticleText from "@util/extractArticleText";
import { Queue, Worker } from "bullmq";

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
    this.queue = new Queue(this.name);
    this.events = new Worker(this.name, async (job) => {
      if (job.data.type === "article") {
        console.log("new article incoming");
        await extractArticleText(job.data.payload.url);
      }
    });
  }
  public add(data: ExtractTextQueueJob) {
    this.queue.add(this.name, data);
  }
}

export default ExtractTextQueue;
