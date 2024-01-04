import { Job, QueueEvents, Queue } from "bullmq";
import queueConnection from "@util/misc/queueConnection";
import Elysia from "elysia";

const socketRouter = (app: Elysia) =>
  app
    .ws("/audio_queue", {
      async open(ws) {
        const queue = new Queue("get_audio", { connection: queueConnection });

        let audioQueue: any = [];

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

        for (const job of jobs) {
          console.log(job);

          audioQueue.push({
            jobId: job.id,
            data: job.data.payload ? job.data : job.data.payload,
            status: await job.getState(),
          });
        }

        console.log(audioQueue);

        ws.send(JSON.stringify({ audioQueue }));

        const audio_events = new QueueEvents("get_audio", {
          connection: queueConnection,
        });

        audio_events.on("added", async ({ jobId }) => {
          const job = await Job.fromId(queue, jobId);
          audioQueue.push({ jobId, data: job?.data, status: "added" });
          ws.send(JSON.stringify({ audioQueue }));
        });
        audio_events.on("completed", async ({ jobId }) => {
          audioQueue = audioQueue.filter((item: any) => {
            return item.jobId.toString() !== jobId;
          });

          ws.send(JSON.stringify({ audioQueue }));
        });
      },
    })
    .ws("/transcripts_queue", {
      async open(ws) {
        const queue = new Queue("extract_text", {
          connection: queueConnection,
        });
        // const jobs = await queue.getJobs(["active", "wait"]);

        const transcript_events = new QueueEvents("extract_text", {
          connection: queueConnection,
        });

        let transcriptQueue: any = [];

        transcript_events.on("added", async ({ jobId }) => {
          const job = await Job.fromId(queue, jobId);
          transcriptQueue.push({
            jobId,
            data: job?.data,
            status: "added",
          });

          ws.send(JSON.stringify({ transcriptQueue }));
        });
        transcript_events.on("completed", async ({ jobId }) => {
          transcriptQueue = transcriptQueue.filter((item: any) => {
            return item.jobId.toString() !== jobId;
          });
          ws.send(JSON.stringify({ transcriptQueue }));
        });
      },
    });

export default socketRouter;
