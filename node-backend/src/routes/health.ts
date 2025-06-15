import type { Variables } from "@/context";
import { Hono } from "hono";

export const healthRouter = new Hono<{ Variables: Variables }>().get(
  "/",
  (c) => {
    return c.json({
      status: "ok",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0",
    });
  },
);
