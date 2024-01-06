import ExtractTextQueue, { ExtractTextQueueJob } from "@queue/extractText";
import GetAudioQueue, { AudioInputData } from "@queue/getAudio";
import getDataDirPath from "@util/misc/getDataDirPath";
import { FINISHED_RECORDINGS_RELATIVE_PATH } from "@util/misc/constants";
import { unlink } from "node:fs/promises";
import { Elysia, t } from "elysia";
import db from "@db/init";
import { Queue } from "bullmq";
import queueConnection from "@util/misc/queueConnection";
import {
  EPISODE_TITLE_PLACEHOLDER,
  EPISODE_DESCRIPTION_PLACEHOLDER,
} from "@chirp/shared/constants";

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
            const title: string = transcript.title ?? EPISODE_TITLE_PLACEHOLDER;
            const slug: string =
              transcript.slug ?? EPISODE_DESCRIPTION_PLACEHOLDER;
            const queue = new GetAudioQueue();
            const job: AudioInputData = { id, text, title, slug };
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
        const transcriptQuery = db.query(
          "SELECT * FROM transcripts ORDER BY created_at desc;",
        );
        const stored_transcripts: any = transcriptQuery.all();
        const queue = new Queue("get_audio", { connection: queueConnection });
        const jobs = await queue.getJobs([
          "failed",
          "delayed",
          "active",
          "wait",
          "waiting-children",
          "prioritized",
          "paused",
          "repeat",
        ]);
        const transcripts = [];
        for (const transcript of stored_transcripts) {
          const episodeLocation = `${getDataDirPath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${transcript.id
            }.mp3`;
          const episodeFile = Bun.file(episodeLocation);
          const inQueue = jobs
            .map((job) => job.data.id)
            .some((id) => id === transcript.id);
          const episodeExists = await episodeFile?.exists();
          if (!episodeExists && !inQueue) {
            transcripts.push(transcript);
          }
        }
        return new Response(JSON.stringify(transcripts));
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
    )
    .delete(
      "/jobs/:queueName/:jobId",
      async ({ params: { queueName, jobId } }) => {
        try {
          if (queueName === "get_audio" || queueName === "extract_text") {
            const queue = new Queue(queueName, { connection: queueConnection });
            const job = await queue.getJob(jobId);
            await job?.remove();
            return new Response();
          } else {
            throw new Error("Queue does not exist");
          }
        } catch (e) {
          console.error(e);
        }
      },
      {
        params: t.Object({
          queueName: t.String(),
          jobId: t.String(),
        }),
      },
    );
};

export default apiRequestRouter;
