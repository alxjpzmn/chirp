import { Job, QueueEvents, Queue } from "bullmq";
import queueConnection from "@util/misc/queueConnection";
import Elysia from "elysia";

const socketRouter = (app: Elysia) =>
  app
    .ws("/audio_queue", {
      async open(ws) {
        const queue = new Queue("get_audio", { connection: queueConnection });
        const jobs = await queue.getJobs(["active", "wait"]);

        const audio_events = new QueueEvents("get_audio", {
          connection: queueConnection,
        });

        let audioQueue = [];

        audio_events.on("added", async ({ jobId }) => {
          const job = await Job.fromId(queue, jobId);
          audioQueue.push({ jobId, data: job?.data.payload, status: "added" });
          ws.send(JSON.stringify({ audioQueue }));
        });
        audio_events.on("completed", async ({ jobId }) => {
          const job = await Job.fromId(queue, jobId);
          audioQueue = audioQueue.filter((item) => {
            return item.jobId.toString() !== jobId;
          });
          console.log(audioQueue);

          ws.send(JSON.stringify({ audioQueue }));
        });
      },
    })
    .ws("/transcripts_queue", {
      async open(ws) {
        const queue = new Queue("extract_text", {
          connection: queueConnection,
        });
        const jobs = await queue.getJobs(["active", "wait"]);

        const transcript_events = new QueueEvents("extract_text", {
          connection: queueConnection,
        });

        let transcript_queue = [];

        transcript_events.on("added", async ({ jobId }) => {
          const job = await Job.fromId(queue, jobId);
          transcript_queue.push({
            jobId,
            data: job?.data.payload,
            status: "added",
          });
          console.log(transcript_queue);

          ws.send(JSON.stringify({ transcript_queue }));
        });
        transcript_events.on("completed", async ({ jobId }) => {
          const job = await Job.fromId(queue, jobId);
          transcript_queue = transcript_queue.filter((item) => {
            return item.jobId.toString() !== jobId;
          });
          ws.send(JSON.stringify({ transcript_queue }));
        });
      },
    });

export default socketRouter;
