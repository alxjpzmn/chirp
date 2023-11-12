import { Router } from "@stricjs/router";
import all from "@util/all";

const app = new Router();

app.post(
  "/",
  (ctx) => {
    const { url, type } = ctx?.data;
    console.log(url);
    // all();
  },
  { body: "json" },
);

export default app;
