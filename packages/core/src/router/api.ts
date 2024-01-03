import ExtractTextQueue, { ExtractTextQueueJob } from "@queue/extractText";
import { db } from "@db/init";
import { transcripts } from "@db/schema";
import { eq } from "drizzle-orm";
import GetAudioQueue, { GetAudioQueueJob } from "@queue/getAudio";
import getBasePath from "@util/misc/getBasePath";
import { FINISHED_RECORDINGS_RELATIVE_PATH } from "@util/misc/constants";
import getServiceUrl from "@util/misc/getServiceUrl";
import { unlink } from "node:fs/promises";
import { Elysia, t } from "elysia";

const apiRequestRouter = (app: Elysia) => {
  return app
    ?.get("/health", () => "API is up")
    .post("/article", ({ body }) => {
      console.log(body);

      const { url } = JSON.parse(body);
      const queue = new ExtractTextQueue();
      const job: ExtractTextQueueJob = {
        type: "article",
        payload: { url },
      };
      queue.add(job);
    })
    .post("/audio", ({ body }) => {
      try {
        const { id } = JSON.parse(body);
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
      } catch (e) {
        console.log(e);
      }
    })
    .get("/audio", async () => {
      try {
        const stored_transcripts = db.select().from(transcripts).all();

        const episodes = [];
        for (const transcript of stored_transcripts) {
          const episodeLocation = `${getBasePath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${transcript.id
            }.mp3`;
          const episodeFile = Bun.file(episodeLocation);
          const episodeExists = await episodeFile?.exists();

          if (episodeExists) {
            episodes.push(transcript);
          }
        }

        return new Response(JSON.stringify(episodes));
      } catch (e) {
        console.log(e);
      }
    })
    .delete("/audio/:episodeId", async ({ params: { episodeId } }) => {
      const episodeLocation = `${getBasePath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${episodeId}.mp3`;
      await unlink(episodeLocation);
      return new Response();
    })
    .get("/transcripts", async () => {
      const stored_transcripts = db.select().from(transcripts).all();
      const episodes = [];
      for (const transcript of stored_transcripts) {
        const episodeLocation = `${getBasePath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${transcript.id
          }.mp3`;
        const episodeFile = Bun.file(episodeLocation);
        const episodeExists = await episodeFile?.exists();
        if (!episodeExists) {
          episodes.push(transcript);
        }
      }
      return new Response(JSON.stringify(episodes));
    })
    .delete(
      "/transcripts/:transcriptId",
      async ({ params: { transcriptId } }) => {
        await db
          .delete(transcripts)
          .where(eq(transcripts.id, parseInt(transcriptId)));
        return new Response();
      },
    )
    .get("/feed", () => {
      return new Response(
        JSON.stringify({ feedUrl: `${getServiceUrl()}/files/feed` }),
      );
    });
};

export default apiRequestRouter;
