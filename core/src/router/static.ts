import getBasePath from "@util/misc/getBasePath";
import { log } from "console";

const staticRouter = (app) =>
  app
    .get("/", () => {
      console.log("static route hit");
      const fileToServe = Bun.file(`${getBasePath()}/dist/index.html`);

      return new Response(fileToServe, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    })
    .get("/:asset", ({ params: { asset } }) => {
      console.log(asset);
      console.log("static route asset hit");

      const fileToServe = Bun.file(`${getBasePath()}/dist/assets/${asset}`);
      return new Response(fileToServe, {
        headers: {
          "Content-Type": fileToServe.type,
        },
      });
    });

export default staticRouter;
