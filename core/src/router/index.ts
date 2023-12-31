import { Elysia } from "elysia";
import fileRequestRouter from "./files";
import apiRequestRouter from "./api";
import staticRouter from "./static";
import socketRouter from "./sockets";

const router = () =>
  new Elysia()
    .group("/", (app) => staticRouter(app))
    .group("/api", (app) => apiRequestRouter(app))
    .group("/files", (app) => fileRequestRouter(app))
    .group("/sockets", (app) => socketRouter(app))
    .listen(Bun.env.PORT ?? 3000);

export default router;
