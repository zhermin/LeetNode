// React, Next and Next-Auth
import React from "react";
import type { AppType } from "next/app";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

// Data Fetching: React-Query and Axios
import {
  Hydrate,
  DehydratedState,
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AxiosError, AxiosResponse } from "axios";

// Notification System: React-Hot-Toast
import toast, { Toaster } from "react-hot-toast";

// Styles: Mantine and Tailwind
import "../styles/globals.css";
import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";

// Others: React PDF Renderer
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Main App
const LeetNode: AppType<{
  session: Session | null;
  dehydratedState: DehydratedState;
}> = ({ Component, pageProps: { session, dehydratedState, ...pageProps } }) => {
  const toastId = React.useRef<string | undefined>(undefined);
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // staleTime: 1000 * 60 * 60 * 24, // 24 hours
            refetchOnWindowFocus: false,
          },
        },
        mutationCache: new MutationCache({
          onMutate: () => {
            toastId.current = toast.loading("Loading...");
          },
          onSuccess: (res) => {
            const { data } = res as AxiosResponse;

            if (data && data.message && data.customIcon) {
              // For custom toast, return {...res, data: {...res.data, customIcon: "", message: ""}}}
              toast(() => data.message, {
                id: toastId.current,
                icon: data.customIcon,
              });
            } else if (data && data.message) {
              // For custom message, return {...res, data: {...res.data, message: ""}}
              toast.success(data.message, {
                id: toastId.current,
              });
            } else {
              toast.success("Success!", {
                id: toastId.current,
              });
            }
          },
          onError: (error) => {
            let errorMessage = "Unknown Error";

            // TEMP: If error is from Prisma (database), ugly-extract the error message
            if (
              error instanceof AxiosError &&
              error.response &&
              error.response.data
            ) {
              const jsonStr = error.response.data.match(
                /<script id="__NEXT_DATA__".*?>(.*?)<\/script>/s
              )[1];
              const data = JSON.parse(jsonStr);
              errorMessage = data.err.message;
            }

            if (error instanceof Error || error instanceof AxiosError) {
              errorMessage = error.message;
            }

            toast.error(`Please contact support\n\n${errorMessage}`, {
              id: toastId.current,
            });
          },
        }),
      })
  );

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={dehydratedState}>
          <ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
          >
            <MantineProvider
              theme={{ colorScheme, primaryColor: "cyan", loader: "dots" }}
              withGlobalStyles
              withNormalizeCSS
            >
              <Component {...pageProps} />
            </MantineProvider>
          </ColorSchemeProvider>
          <Toaster />
          <ReactQueryDevtools position="bottom-right" />
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default LeetNode;
