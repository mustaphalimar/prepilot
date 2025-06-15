import { type Context as HonoContext } from "hono";
import type { User } from "@clerk/backend";

// Define a custom context type
export type Variables = {
  user: User | null;
};

export type Context = HonoContext<{
  Variables: Variables;
}>;
