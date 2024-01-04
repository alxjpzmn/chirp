import {
  FEED_DATA_FOLDER_NAME,
  FILE_FOLDER_NAME,
  FINISHED_RECORDINGS_RELATIVE_PATH,
} from "@util/misc/constants";
import getDataDirPath from "@util/misc/getDataDirPath";
import createFeed from "@util/feedCreation/createFeed";
import Elysia, { t } from "elysia";
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
          },
        },
      );
    })
    .get("/cover", () =>
      Bun.file(
        `${getDataDirPath()}/${FILE_FOLDER_NAME}/${FEED_DATA_FOLDER_NAME}/cover.jpg`,
      ),
    )
    .get(
      "/episode/:episodeId",
      ({ params: { episodeId } }) => {
        return new Response(
          Bun.file(
            `${getDataDirPath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${episodeId}.mp3`,
          ),
          {
            headers: {
              "Content-Type": "audio/mpeg",
              "Accept-Ranges": "bytes",
            },
          },
        );
      },
      {
        params: t.Object({
          episodeId: t.String(),
        }),
      },
    );

export default fileRequestRouter;
