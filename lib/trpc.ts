import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const env = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (env) return env;

  // Fall back to a sensible localhost URL during development so the app
  // doesn't crash if the developer hasn't set the env var. In production
  // we still require the variable to be set.
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(
      "EXPO_PUBLIC_RORK_API_BASE_URL is not set — defaulting to http://localhost:3000 for development"
    );
    return "http://localhost:3000";
  }

  throw new Error("No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL");
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
