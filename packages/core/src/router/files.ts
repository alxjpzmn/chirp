import {
  FEED_DATA_FOLDER_NAME,
  FILE_FOLDER_NAME,
  FINISHED_RECORDINGS_RELATIVE_PATH,
} from "@util/misc/constants";
import getDataDirPath from "@util/misc/getDataDirPath";
import createFeed from "@util/feedCreation/createFeed";
import Elysia from "elysia";
import getServiceUrl from "@util/misc/getServiceUrl";

const fileRequestRouter = (app: Elysia) =>
  app
    .get("/feed", async ({ headers }) => {
      const host = `${Bun.env.SSL === "true" ? "https://" : "http://"}${headers.host
        }`;
      await createFeed(host ?? getServiceUrl());
      return new Response(
        Bun.file(
          `${getDataDirPath()}/${FILE_FOLDER_NAME}/${FEED_DATA_FOLDER_NAME}/feed.xml`,
        ),
        {
          headers: {
            "Content-Type": "application/xml",
            "Accept-Ranges": "none",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    })
    .get("/cover", () => {
      return new Response(
        Bun.file(
          `${getDataDirPath()}/${FILE_FOLDER_NAME}/${FEED_DATA_FOLDER_NAME}/cover.jpg`,
        ),
        {
          headers: {
            "Content-Type": "image/jpeg",
            "Accept-Ranges": "none",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    })
    .get("/episode/:episodeId", ({ params: { episodeId } }) => {
      return new Response(
        Bun.file(
          `${getDataDirPath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${episodeId}.mp3`,
        ),
        {
          headers: {
            "Content-Type": "audio/mpeg",
            "Accept-Ranges": "bytes",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    });

export default fileRequestRouter;
