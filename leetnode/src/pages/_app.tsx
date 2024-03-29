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

            if (data && data.customToast) {
              // For completely custom toasts, return .json{customToast: true} in the response
              toast.dismiss(toastId.current);
            } else if (data && data.message && data.customIcon) {
              // For custom icons, return .json{customIcon: "...", message: "..."} in the response
              toast(() => data.message, {
                id: toastId.current,
                icon: data.customIcon,
              });
            } else if (data && data.message) {
              // For custom messages, return .json{message: "..."} in the response
              toast.success(data.message, {
                id: toastId.current,
              });
            } else {
              toast.success("Success!", {
                id: toastId.current,
              });
            }

            // Fallback to dismiss all toasts after 10 seconds
            setTimeout(() => {
              toast.dismiss();
            }, 10000);
          },
          onError: (error) => {
            console.error("[GLOBAL ERROR]", error);

            let errorMessage = "Unknown Error";

            if (error instanceof AxiosError) {
              errorMessage = error.response
                ? error.response.data.message
                : error.message;
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }

            toast.error(
              `Error: ${errorMessage}\n\nPlease contact support for further assistance`,
              {
                id: toastId.current,
              }
            );
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
