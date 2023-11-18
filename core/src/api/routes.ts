import { Router } from "@stricjs/router";
import ExtractTextQueue, * as extractText from "@queue/extractText";
import getTextToSpeechFile from "@util/getTextToSpeechFile";
import { db } from "@db/init";
import { articles } from "@db/schema";
import { eq } from "drizzle-orm";

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
api.post(
  "/tts",
  (ctx) => {
    const { id } = ctx?.data;
    const extracted_article = db
      .select()
      .from(articles)
      .where(eq(articles.id, id))
      .all()[0];
    if (extracted_article.content) {
      getTextToSpeechFile(extracted_article?.content, extracted_article?.id);
    }
    return new Response();
  },
  { body: "json" },
);

export default api;
