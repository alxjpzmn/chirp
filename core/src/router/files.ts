import {
  AUDIO_FOLDER_NAME,
  FEED_DATA_FOLDER_NAME,
  FILE_FOLDER_NAME,
  FINISHED_RECORDINGS_FOLDER_NAME,
  FINISHED_RECORDINGS_RELATIVE_PATH,
} from "@util/misc/constants";
import getBasePath from "@util/misc/getBasePath";
import createFeed from "@util/feedCreation/createFeed";

const fileRequestRouter = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  if (url.pathname.includes("/feed")) {
    await createFeed();
    return new Response(
      Bun.file(
        `${getBasePath()}/${FILE_FOLDER_NAME}/${FEED_DATA_FOLDER_NAME}/feed.xml`,
      ),
      {
        headers: {
          "Content-Type": "application/xml",
          "Accept-Ranges": "none",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
  if (url.pathname.includes("/cover"))
    return new Response(
      Bun.file(
        `${getBasePath()}/${FILE_FOLDER_NAME}/${FEED_DATA_FOLDER_NAME}/cover.jpg`,
      ),
      {
        headers: {
          "Content-Type": "image/jpeg",
          "Accept-Ranges": "none",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  if (url.pathname.includes("/episode/"))
    return new Response(
      Bun.file(
        `${getBasePath()}/${FINISHED_RECORDINGS_RELATIVE_PATH}/${url.pathname
          .split("/")
          .filter((segment: string) => segment !== "")
          .pop()}.mp3`,
      ),
      {
        headers: {
          "Content-Type": "audio/mpeg",
          "Accept-Ranges": "bytes",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  return new Response("404");
};

export default fileRequestRouter;
