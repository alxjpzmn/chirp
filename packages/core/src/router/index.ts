import { Elysia } from "elysia";
import fileRequestRouter from "@router/files";
import apiRequestRouter from "@router/api";
import staticRouter from "@router/static";
import socketRouter from "@router/sockets";

const router = () =>
  new Elysia()
    .group("/", (app) => staticRouter(app))
    .group("/assets", (app) => staticRouter(app))
    .group("/api", (app) => apiRequestRouter(app))
    .group("/files", (app) => fileRequestRouter(app))
    .group("/sockets", (app) => socketRouter(app))
    .listen(Bun.env.PORT ?? 3000);

export default router;
