import { Hono } from "hono";
import { cors } from "hono/cors";
import axios from "axios";
import { HTTPException } from "hono/http-exception";
import type { ErrorResponse } from "@/types";
import { healthRouter } from "@/routes/health";
import { studyPlansRouter } from "@/routes/study-plans";

const app = new Hono();

app.use("*", cors({ origin: Bun.env.CLIENT_ORIGIN!! }));
app.get("/", (c) => c.text("Hello Bun!"));

const routes = app
  .basePath("/v1")
  .route("/health", healthRouter)
  .route("/study-plans", studyPlansRouter);

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    const errResponse =
      err.res ??
      c.json<ErrorResponse>(
        {
          success: false,
          error: err.message,
          isFormError:
            err.cause && typeof err.cause === "object" && "form" in err.cause
              ? err.cause.form === true
              : false,
        },
        err.status,
      );
    return errResponse;
  }

  return c.json<ErrorResponse>(
    {
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error."
          : (err.stack ?? err.message),
    },
    500,
  );
});

export default {
  port: Bun.env.PORT ?? 8080,
  fetch: app.fetch,
};
export type ApiRoutes = typeof routes;
