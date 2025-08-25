export const marketingEnabled =
  String(process.env.MARKETING_ENABLED || "false").toLowerCase() === "true";
