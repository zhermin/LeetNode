import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";

import { Stack } from "@mantine/core";

export default function MarkdownLatex({ children }: { children: string }) {
  return (
    <Stack>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        className="markdown"
      >
        {children}
      </ReactMarkdown>
    </Stack>
  );
}
