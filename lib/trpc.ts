import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env;

  // Always default to localhost - don't crash the app if not set
  console.warn(
    "EXPO_PUBLIC_API_BASE_URL is not set — defaulting to http://localhost:3000"
  );
  return "http://localhost:3000";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
