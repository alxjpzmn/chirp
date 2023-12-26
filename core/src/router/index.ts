import getServiceUrl from "@util/misc/getServiceUrl";
import fileRequestRouter from "./files";
import apiRequestRouter from "./api";
import fallbackResponse from "@util/misc/fallbackResponse";
import getBasePath from "@util/misc/getBasePath";
import staticRouter from "./static";

const router = () => {
  Bun.serve({
    async fetch(req) {
      const url = new URL(req.url);

      const serviceComponent = url?.pathname
        ?.split("/")
        ?.filter((segment) => segment !== "")
        .shift();

      let res: Response = fallbackResponse;

      switch (serviceComponent) {
        case "api":
          res = await apiRequestRouter(req);
          break;
        case "files":
          res = await fileRequestRouter(req);
          break;
        default:
          res = await staticRouter(req);
      }

      return res;
    },
    error(error) {
      console.error(error);
      return new Response(`<pre>${error}\n${error.stack}</pre>`, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    },
  });
  console.log(`API is up, listening on ${getServiceUrl()}`);
};

export default router;
