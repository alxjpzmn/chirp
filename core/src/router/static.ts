import getBasePath from "@util/misc/getBasePath";

const staticRouter = (app) =>
  app
    .get("/assets/:asset", ({ params: { asset } }) => {
      const fileToServe = Bun.file(`${getBasePath()}/dist/assets/${asset}`);
      return new Response(fileToServe, {
        headers: {
          "Content-Type": fileToServe.type,
        },
      });
    })
    .get("/", () => {
      const fileToServe = Bun.file(`${getBasePath()}/dist/index.html`);

      return new Response(fileToServe, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    });

export default staticRouter;
