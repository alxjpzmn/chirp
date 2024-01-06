import { Job, QueueEvents, Queue, JobType } from "bullmq";
import queueConnection from "@util/misc/queueConnection";
import Elysia from "elysia";
import {
  AudioEventMessage,
  JobState,
  TranscriptEventMessage,
  jobStates,
} from "@chirp/shared/types";

const socketRouter = (app: Elysia) =>
  app
    .ws("/audio_queue", {
      async open(ws) {
        const queue = new Queue("get_audio", { connection: queueConnection });

        const incompleteJobs = await queue.getJobs(
          jobStates.filter(
            (jobState) => jobState !== JobState.Completed,
          ) as JobType[],
        );

        let initialAudioMessages: AudioEventMessage[] = [];

        for (const job of incompleteJobs) {
          initialAudioMessages.push({
            jobId: job.id as string,
            data: job.data,
            status: (await job.getState()) as JobState,
            errorMessage: job.failedReason,
          });
        }

        ws.send({ payload: initialAudioMessages, type: "initial" });

        const audio_events = new QueueEvents("get_audio", {
          connection: queueConnection,
        });

        for (const jobState of jobStates.filter(
          (state) => state !== JobState.Repeat,
        )) {
          audio_events.on(jobState, async ({ jobId }) => {
            const job = await Job.fromId(queue, jobId);
            ws.send(
              JSON.stringify({
                payload: {
                  jobId,
                  data: job?.data,
                  status: jobState,
                  errorMessage: job?.failedReason,
                },
                type: "update",
              }),
            );
          });
        }
      },
    })
    .ws("/transcripts_queue", {
      async open(ws) {
        const queue = new Queue("extract_text", {
          connection: queueConnection,
        });
        let initialTranscriptMessages: TranscriptEventMessage[] = [];

        const incompleteJobs = await queue.getJobs(
          jobStates.filter(
            (jobState) => jobState !== JobState.Completed,
          ) as JobType[],
        );
        for (const job of incompleteJobs) {
          initialTranscriptMessages.push({
            jobId: job.id as string,
            data: job.data,
            status: (await job.getState()) as JobState,
            errorMessage: job.failedReason,
          });
        }
        ws.send({ payload: initialTranscriptMessages, type: "initial" });

        const transcript_events = new QueueEvents("extract_text", {
          connection: queueConnection,
        });

        for (const jobState of jobStates.filter(
          (state) => state !== JobState.Repeat,
        )) {
          transcript_events.on(jobState, async ({ jobId }) => {
            const job = await Job.fromId(queue, jobId);
            ws.send(
              JSON.stringify({
                payload: {
                  jobId,
                  data: job?.data,
                  status: jobState,
                  errorMessage: job?.failedReason,
                },
                type: "update",
              }),
            );
          });
        }
      },
    });

export default socketRouter;
