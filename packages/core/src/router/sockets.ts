import { Job, QueueEvents, Queue } from "bullmq";
import queueConnection from "@util/misc/queueConnection";
import Elysia from "elysia";
import { JobState, jobStates } from "@chirp/shared/types";

const socketRouter = (app: Elysia) =>
  app
    .ws("/audio_queue", {
      async open(ws) {
        const queue = new Queue("get_audio", { connection: queueConnection });

        let audioQueue: any = [];
        const states = jobStates.filter(
          (jobState) => jobState !== JobState.Completed,
        );

        const incompleteJobs = await queue.getJobs(
          jobStates.filter((jobState) => jobState !== JobState.Completed),
        );

        for (const job of incompleteJobs) {
          audioQueue.push({
            jobId: job.id,
            data: job.data.payload ? job.data : job.data.payload,
            status: await job.getState(),
            errorMessage: job.failedReason,
          });
        }

        ws.send(JSON.stringify({ audioQueue }));

        const audio_events = new QueueEvents("get_audio", {
          connection: queueConnection,
        });

        audio_events.on(JobState.Added, async ({ jobId }) => {
          const job = await Job.fromId(queue, jobId);
          audioQueue.push({ jobId, data: job?.data, status: "added" });
          ws.send(JSON.stringify({ audioQueue }));
        });
        audio_events.on(JobState.Completed, async ({ jobId }) => {
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
