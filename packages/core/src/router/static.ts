import getBasePath from "@util/misc/getBasePath";
import Elysia, { t } from "elysia";

const staticRouter = (app: Elysia) =>
  app
    .get("/", () => Bun.file(`${getBasePath()}/dist/index.html`))
    .get(
      "/:asset",
      ({ params: { asset } }) =>
        Bun.file(`${getBasePath()}/dist/assets/${asset}`),
      {
        params: t.Object({
          asset: t.String(),
        }),
      },
    );

export default staticRouter;
