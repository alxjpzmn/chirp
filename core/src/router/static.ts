import fallbackResponse from "@util/misc/fallbackResponse";
import getBasePath from "@util/misc/getBasePath";

const staticRouter = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);

  if (url.pathname.includes("/assets/")) {
    const fileToServe = Bun.file(
      `${getBasePath()}/dist/assets/${url.pathname
        .split("/")
        .filter((segment) => segment !== "")
        .pop()}`,
    );
    return new Response(fileToServe, {
      headers: {
        "Content-Type": fileToServe.type,
      },
    });
  }
  const fileToServe = Bun.file(`${getBasePath()}/dist/index.html`);

  return new Response(fileToServe, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });

  return fallbackResponse;
};

export default staticRouter;
