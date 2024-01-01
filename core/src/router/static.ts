import getBasePath from "@util/misc/getBasePath";
import { log } from "console";
import Elysia from "elysia";

const staticRouter = (app: Elysia) =>
  app
    .get("/", () => {
      const fileToServe = Bun.file(`${getBasePath()}/dist/index.html`);

      return new Response(fileToServe, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    })
    .get("/:asset", ({ params: { asset } }) => {
      const fileToServe = Bun.file(`${getBasePath()}/dist/assets/${asset}`);
      return new Response(fileToServe, {
        headers: {
          "Content-Type": fileToServe.type,
        },
      });
    });

export default staticRouter;
