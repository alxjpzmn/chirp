import ExtractTextQueue, { ExtractTextQueueJob } from "@queue/extractText";
import GetAudioQueue, { GetAudioQueueJob } from "@queue/getAudio";
import getDataDirPath from "@util/misc/getDataDirPath";
import {
  DESCRIPTION_PLACEHOLDER,
  FINISHED_RECORDINGS_RELATIVE_PATH,
  TITLE_PLACEHOLDER,
} from "@util/misc/constants";
import { unlink } from "node:fs/promises";
import { Elysia, t } from "elysia";
import db from "@db/init";

const apiRequestRouter = (app: Elysia) => {
  return app
    ?.get("/health", () => "API is up")
    .post(
      "/article",
      ({ body: { url } }) => {
        try {
          const queue = new ExtractTextQueue();
          const job: ExtractTextQueueJob = {
            type: "article",
            payload: { url },
          };
          queue.add(job);
          return new Response();
        } catch (e) {
          console.error(e);
        }
      },
      {
        type: "json",
        body: t.Object({ url: t.String() }),
      },
    )
    .post(
      "/audio",
      ({ body: { id } }) => {
        try {
          const transcriptQuery = db.query(
            "SELECT * FROM transcripts WHERE id = $id",
          );
          const transcript: any = transcriptQuery.get({
            $id: id,
          });

          if (transcript.content) {
            const text: string = Bun.env.MAX_ARTICLE_CHARS
              ? transcript.content.slice(0, parseInt(Bun.env.MAX_ARTICLE_CHARS))
              : transcript.content;
            const title: string = transcript.title ?? TITLE_PLACEHOLDER;
            const slug: string = transcript.slug ?? DESCRIPTION_PLACEHOLDER;
            const queue = new GetAudioQueue();
            const job: GetAudioQueueJob = {
              payload: { id, text, title, slug },
            };
            queue.add(job);
          }
          return new Response();
        } catch (e) {
          console.error(e);
        }
      },
      {
        type: "json",
        body: t.Object({ id: t.Number() }),
      },
    )
    .get("/audio", async () => {
      try {
        const transcriptQuery = db.query("SELECT * FROM transcripts;");
        const stored_transcripts: any = transcriptQuery.all();

        const episodes = [];
        for (const transcript of stored_transcripts) {
          const episodeLocation = `${getDataDirPath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${transcript.id
            }.mp3`;
          const episodeFile = Bun.file(episodeLocation);
          const episodeExists = await episodeFile?.exists();

          if (episodeExists) {
            episodes.push(transcript);
          }
        }
        return new Response(JSON.stringify(episodes));
      } catch (e) {
        console.error(e);
      }
    })
    .delete(
      "/audio/:episodeId",
      async ({ params: { episodeId } }) => {
        try {
          const episodeLocation = `${getDataDirPath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${episodeId}.mp3`;
          await unlink(episodeLocation);
          return new Response();
        } catch (e) {
          console.error(e);
        }
      },
      {
        params: t.Object({
          episodeId: t.String(),
        }),
      },
    )
    .get("/transcripts", async () => {
      try {
        const transcriptQuery = db.query("SELECT * FROM transcripts;");
        const stored_transcripts: any = transcriptQuery.all();

        const episodes = [];
        for (const transcript of stored_transcripts) {
          const episodeLocation = `${getDataDirPath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${transcript.id
            }.mp3`;
          const episodeFile = Bun.file(episodeLocation);
          const episodeExists = await episodeFile?.exists();
          if (!episodeExists) {
            episodes.push(transcript);
          }
        }
        return new Response(JSON.stringify(episodes));
      } catch (e) {
        console.error(e);
      }
    })
    .delete(
      "/transcripts/:transcriptId",
      async ({ params: { transcriptId } }) => {
        try {
          const deletionQuery = db.query(
            `delete from transcripts where id = $id`,
          );
          deletionQuery.run({ $id: transcriptId });
          return new Response();
        } catch (e) {
          console.error(e);
        }
      },
      {
        params: t.Object({
          transcriptId: t.String(),
        }),
      },
    );
};

export default apiRequestRouter;
