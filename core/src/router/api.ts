import ExtractTextQueue, { ExtractTextQueueJob } from "@queue/extractText";
import { db } from "@db/init";
import { articles } from "@db/schema";
import { eq } from "drizzle-orm";
import GetAudioQueue, { GetAudioQueueJob } from "@queue/getAudio";
import fallbackResponse from "@util/misc/fallbackResponse";
import getBasePath from "@util/misc/getBasePath";
import { FINISHED_RECORDINGS_RELATIVE_PATH } from "@util/misc/constants";

const apiRequestRouter = async (req: Request): Promise<Response> => {
  const { method, url: urlString } = req;
  const url = new URL(urlString);
  if (url.pathname.includes("/health") && method === "GET") {
    return new Response("API is up.");
  }
  if (url.pathname.includes("/article") && method === "POST") {
    const { url } = await req.json();
    const queue = new ExtractTextQueue();
    const job: ExtractTextQueueJob = {
      type: "article",
      payload: { url },
    };
    queue.add(job);
    return new Response();
  }
  if (url.pathname.includes("/audio") && method === "POST") {
    const { id } = await req.json();
    const extracted_article = db
      .select()
      .from(articles)
      .where(eq(articles.id, id))
      .all()[0];
    if (extracted_article.content) {
      const text: string = Bun.env.MAX_ARTICLE_CHARS
        ? extracted_article.content.slice(
          0,
          parseInt(Bun.env.MAX_ARTICLE_CHARS),
        )
        : extracted_article.content;
      const title: string = extracted_article.title ?? "Untitled Episode";
      const slug: string =
        extracted_article.slug ?? "This episode doesn't have a description.";
      const queue = new GetAudioQueue();
      const job: GetAudioQueueJob = {
        payload: { id, text, title, slug },
      };
      queue.add(job);
    }
    return new Response();
  }
  if (url.pathname.includes("/audio") && method === "GET") {
    const articlesInDb = db.select().from(articles).all();

    const episodes = [];

    for (const articleInDb of articlesInDb) {
      const episodeLocation = `${getBasePath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${articleInDb.id
        }.mp3`;
      const episodeFile = Bun.file(episodeLocation);
      const episodeExists = await episodeFile?.exists();
      if (episodeExists) {
        episodes.push(articleInDb);
      }
    }

    console.log(episodes);

    return new Response(JSON.stringify(episodes));
  }
  return fallbackResponse;
};

export default apiRequestRouter;
