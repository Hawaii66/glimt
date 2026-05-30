import { ConvexError } from "convex/values";

export function getConvexErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
): string {
  if (error instanceof ConvexError) {
    const { data } = error;
    if (typeof data === "string") {
      return data;
    }
  }

  if (error instanceof Error) {
    const uncaught = error.message.match(
      /Uncaught (?:Convex )?Error:\s*(.+?)(?:\s+at\s|\s*$)/s,
    );
    if (uncaught?.[1]) {
      return uncaught[1].trim();
    }

    if (error.message.startsWith("[CONVEX")) {
      const stripped = error.message
        .replace(/^\[CONVEX[^\]]*\]\s*/g, "")
        .replace(/^\[Request ID:[^\]]*\]\s*/g, "")
        .replace(/^(?:Server Error\s*)?/i, "")
        .replace(/^(?:Uncaught )?(?:Convex )?Error:\s*/i, "")
        .trim();
      if (stripped) {
        return stripped;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  return fallback;
}
