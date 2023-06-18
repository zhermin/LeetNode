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
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      className="md:text-md self-center px-3 text-xs text-gray-800 dark:text-gray-200 sm:text-sm"
      {...props}
    >
      {children}
    </ReactMarkdown>
  );
}
