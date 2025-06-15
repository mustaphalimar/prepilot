import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => c.text("Hello Bun!"));

export default {
  port: Bun.env.PORT ?? 8080,
  fetch: app.fetch,
};
