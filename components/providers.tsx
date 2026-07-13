"use client";

import * as React from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

const WEEK = 1000 * 60 * 60 * 24 * 7;

// localStorage persister — noop on the server (no window), real in the browser.
const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "leangain-cache",
});

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Serve cached data immediately; refetch in the background.
            staleTime: 30_000,
            gcTime: WEEK,
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
        },
      })
  );

  return (
    <PersistQueryClientProvider client={client} persistOptions={{ persister, maxAge: WEEK }}>
      {children}
    </PersistQueryClientProvider>
  );
}
