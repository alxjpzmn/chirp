// https://github.com/elysiajs/elysia/issues/354
// @ts-nocheck
import { Elysia } from "elysia";
import fileRequestRouter from "@router/files";
import apiRequestRouter from "@router/api";
import staticRouter from "@router/static";
import socketRouter from "@router/sockets";
import getBasePath from "@util/misc/getBasePath";

const router = () =>
  new Elysia()
    .group("/", (app) => staticRouter(app))
    .group("/assets", (app) => staticRouter(app))
    .group("/api", (app) => apiRequestRouter(app))
    .group("/files", (app) => fileRequestRouter(app))
    .group("/sockets", (app) => socketRouter(app))
    .onError(({ code }) => {
      if (code === "NOT_FOUND")
        return Bun.file(`${getBasePath()}/dist/index.html`);
    })
    .listen(Bun.env.PORT ?? 3000);

export default router;
