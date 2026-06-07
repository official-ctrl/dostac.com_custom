import { QueryClient, isServer } from "@tanstack/react-query";
import { setBaseUrl } from "@workspace/api-client-react";

// Set baseUrl once at module load — safe for concurrent requests because
// the value is the same for all server-side requests in this process.
if (isServer) {
  const internalUrl = process.env.INTERNAL_API_URL ?? "http://localhost:4000";
  setBaseUrl(internalUrl);
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (isServer) {
    // Server: new instance per request — no singleton risk
    return makeQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
