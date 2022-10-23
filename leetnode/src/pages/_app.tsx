// Next and Next-Auth
import type { AppType } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import React from "react";

// React-Query
import {
  Hydrate,
  DehydratedState,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Styles
import "../styles/globals.css";
import "katex/dist/katex.min.css";
import { MantineProvider, createEmotionCache } from "@mantine/core";
const appendCache = createEmotionCache({ key: "mantine", prepend: false });

// Main App
const LeetNode: AppType<{
  session: Session | null;
  dehydratedState: DehydratedState;
}> = ({ Component, pageProps: { session, dehydratedState, ...pageProps } }) => {
  const queryClient = React.useRef(new QueryClient()).current;
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={dehydratedState}>
          <MantineProvider
            emotionCache={appendCache}
            withGlobalStyles
            withNormalizeCSS
          >
            <Component {...pageProps} />
          </MantineProvider>
          <ReactQueryDevtools />
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default LeetNode;
