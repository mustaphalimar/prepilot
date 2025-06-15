import type { Context, Variables } from "@/context";
import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";

export const loggedIn = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const user = c.get("user");
    if (!user) {
      throw new HTTPException(401, { message: "Unauthorized" });
    }
    await next();
  },
);
