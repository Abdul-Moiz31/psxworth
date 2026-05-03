import posthog from "posthog-js";

//Setup Posthog on client side.
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: "2025-05-24",
  capture_exceptions: true, // Enables capturing exceptions using Error Tracking
  debug: process.env.NODE_ENV === "development",
});
