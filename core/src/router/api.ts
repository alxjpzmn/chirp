import ExtractTextQueue, { ExtractTextQueueJob } from "@queue/extractText";
import { db } from "@db/init";
import { transcripts } from "@db/schema";
import { eq } from "drizzle-orm";
import GetAudioQueue, { GetAudioQueueJob } from "@queue/getAudio";
import fallbackResponse from "@util/misc/fallbackResponse";
import getBasePath from "@util/misc/getBasePath";
import { FINISHED_RECORDINGS_RELATIVE_PATH } from "@util/misc/constants";
import getServiceUrl from "@util/misc/getServiceUrl";
import { Server } from "bun";

const apiRequestRouter = async (
  req: Request,
  server: Server,
): Promise<Response> => {
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
    const transcript = db
      .select()
      .from(transcripts)
      .where(eq(transcripts.id, id))
      .all()[0];
    if (transcript.content) {
      const text: string = Bun.env.MAX_ARTICLE_CHARS
        ? transcript.content.slice(0, parseInt(Bun.env.MAX_ARTICLE_CHARS))
        : transcript.content;
      const title: string = transcript.title ?? "Untitled Episode";
      const slug: string =
        transcript.slug ?? "This episode doesn't have a description.";
      const queue = new GetAudioQueue();
      const job: GetAudioQueueJob = {
        payload: { id, text, title, slug },
      };
      queue.add(job);
    }
    return new Response();
  }
  if (url.pathname.includes("/audio") && method === "GET") {
    const stored_transcripts = await db.select().from(transcripts).all();

    const episodes = [];
    for (const transcript of stored_transcripts) {
      const episodeLocation = `${getBasePath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${
        transcript.id
      }.mp3`;
      const episodeFile = Bun.file(episodeLocation);
      const episodeExists = await episodeFile?.exists();

      if (episodeExists) {
        episodes.push(transcript);
      }
    }

    return new Response(JSON.stringify(episodes));
  }
  if (url.pathname.includes("/status") && method === "GET") {
    const success = server.upgrade(req, {});
    success
      ? console.log("Upgrade to WebSocket connection successful")
      : new Response("WebSocket upgrade error", { status: 400 });
  }
  if (url.pathname.includes("/transcripts") && method === "GET") {
    const stored_transcripts = await db.select().from(transcripts).all();

    const episodes = [];

    for (const transcript of stored_transcripts) {
      const episodeLocation = `${getBasePath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${
        transcript.id
      }.mp3`;
      const episodeFile = Bun.file(episodeLocation);
      const episodeExists = await episodeFile?.exists();
      if (!episodeExists) {
        episodes.push(transcript);
      }
    }
    return new Response(JSON.stringify(episodes));
  }
  if (url.pathname.includes("/feed") && method === "GET") {
    return new Response(
      JSON.stringify({ feedUrl: `${getServiceUrl()}/files/feed` }),
    );
  }
  return fallbackResponse;
};

export default apiRequestRouter;
