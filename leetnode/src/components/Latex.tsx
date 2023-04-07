import { DetailedHTMLProps, HTMLAttributes, PropsWithChildren } from "react";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import remarkMath from "remark-math";

export default function Latex({
  children,
  ...props
}: PropsWithChildren<{
  children: string;
}> &
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  return (
    <div {...props}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        className="prose"
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
