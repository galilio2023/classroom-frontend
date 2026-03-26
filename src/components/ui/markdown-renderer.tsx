import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const CodeBlock = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <Button
        size="icon"
        variant="ghost"
        className="absolute end-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm hover:bg-background/80"
        onClick={onCopy}
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
      <pre
        className={cn(
          "rounded-xl overflow-x-auto p-4 bg-zinc-950 border border-zinc-800",
          className
        )}
      >
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
};

export const MarkdownRenderer = ({ content, className }: MarkdownRendererProps) => {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        rehypePlugins={[rehypeHighlight]}
        components={{
          pre: ({ node, ...props }) => <div {...(props as any)} />,
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded-md font-mono text-xs" {...props}>
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          h1: ({ node, ...props }) => <h1 className="text-2xl font-black mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="leading-relaxed mb-4" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc ps-6 mb-4 space-y-2" {...props} />,
          ol: ({ node, ...props }) => (
            <ol className="list-decimal ps-6 mb-4 space-y-2" {...props} />
          ),
          li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-s-4 border-primary/30 ps-4 italic my-4 text-muted-foreground"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-primary underline underline-offset-4 font-medium hover:text-primary/80 transition-colors"
              {...props}
            />
          ),
          img: ({ node, ...props }) => (
            <img className="rounded-xl border shadow-lg my-6 max-w-full h-auto" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
