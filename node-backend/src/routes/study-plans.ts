import type { Variables } from "@/context";
import { loggedIn } from "@/middleware/logged-in";
import { Hono } from "hono";

export const studyPlansRouter = new Hono<{ Variables: Variables }>().get(
  "/",
  loggedIn,
  async (c) => {
    const user = c.get("user")!;
    console.log({ user });
  },
);
