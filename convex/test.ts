import { query } from "./_generated/server";
import { v } from "convex/values";

export const test = query({
    args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        return {
            message: `Hello, ${args.name}!`,
        }
    }
})