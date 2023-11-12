import { Router } from "@stricjs/router";
import ExtractTextQueue, * as extractText from "@queue/extractText";

const api = new Router();

api.post(
  "/article",
  (ctx) => {
    const { url } = ctx?.data;
    const queue = new ExtractTextQueue();
    const job: extractText.ExtractTextQueueJob = {
      type: "article",
      payload: { url },
    };
    queue.add(job);
    return new Response();
  },
  { body: "json" },
);

export default api;
