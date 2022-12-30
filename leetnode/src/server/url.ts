export const serverUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://leetnode.vercel.com";
