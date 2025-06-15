import { createClerkClient, verifyToken } from "@clerk/backend";
import { createMiddleware } from "hono/factory";
import type { Context, Variables } from "@/context";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Clerk's JWT verification helper
const getAuthToken = (c: Context) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookie = c.req.header("Cookie") ?? "";
  const match = cookie.match(/__session=([^;]+)/); // Clerk uses __session
  return match?.[1];
};

// Middleware
export const authBridge = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const token = getAuthToken(c);
    if (!token) {
      c.set("user", null);
      return await next();
    }

    try {
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      const user = await clerkClient.users.getUser(payload.sub);
      c.set("user", user);
    } catch (err) {
      c.set("user", null);
    }

    return await next();
  },
);
