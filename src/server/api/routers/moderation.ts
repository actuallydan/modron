import { z } from "zod";
import { getModerationRecommendation } from "../../../pages/api/moderation";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const moderationRouter = createTRPCRouter({
  getModeration: publicProcedure
    .input(z.object({ input: z.string() }))
    .query(async ({ input }) => {
      const customResponse = await getModerationRecommendation(input.input);
      return customResponse;
    }),
});
