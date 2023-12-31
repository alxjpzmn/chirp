import getServiceUrl from "@util/misc/getServiceUrl";
import fileRequestRouter from "./files";
import apiRequestRouter from "./api";
import fallbackResponse from "@util/misc/fallbackResponse";
import staticRouter from "./static";
import { Job, QueueEvents, Queue } from "bullmq";
import queueConnection from "@util/misc/queueConnection";

const router = () => {
  Bun.serve({
    async fetch(req, server) {
      const url = new URL(req.url);

      const serviceComponent = url?.pathname
        ?.split("/")
        ?.filter((segment) => segment !== "")
        .shift();

      let res: Response = fallbackResponse;

      switch (serviceComponent) {
        case "api":
          res = await apiRequestRouter(req, server);
          break;
        case "files":
          res = await fileRequestRouter(req);
          break;
        default:
          res = await staticRouter(req);
      }

      return res;
    },
    error(error) {
      console.error(error);
      return new Response(`<pre>${error}\n${error.stack}</pre>`, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
    websocket: {
      async open(ws) {
        const queue = new Queue("get_audio");
        const jobs = await queue.getJobs(["active", "wait"]);

        const audio_events = new QueueEvents("get_audio", {
          connection: queueConnection,
        });

        let audioQueue = [];

        audio_events.on("added", async ({ jobId }) => {
          const job = await Job.fromId(queue, jobId);
          // console.log(job?.data);
          audioQueue.push({ jobId, data: job?.data.payload, status: "added" });
          ws.send(JSON.stringify({ audioQueue }));
        });
        audio_events.on("completed", async ({ jobId }) => {
          const job = await Job.fromId(queue, jobId);
          audioQueue = audioQueue.filter((item) => {
            console.log(item);
            console.log(item.jobId);

            return item.jobId.toString() !== jobId;
          });
          ws.send(JSON.stringify({ audioQueue }));
        });
      },
      message(ws, message) {},
    },
  });
  console.log(`API is up, listening on ${getServiceUrl()}`);
};

export default router;
