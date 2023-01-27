import { createTRPCRouter } from "./trpc";
import { moderationRouter } from "./routers/moderation";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  moderation: moderationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
