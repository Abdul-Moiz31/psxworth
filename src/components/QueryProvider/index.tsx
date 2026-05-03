"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}
const QueryProvider = (props: QueryProviderProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [client, setClient] = React.useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          staleTime: 10 * 60 * 1000, //10 minutes
          retry: false,
        },
      },
    });
  });

  const children = props.children;

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      ) : null}
    </QueryClientProvider>
  );
};

export default QueryProvider;
