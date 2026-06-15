import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import "github-markdown-css/github-markdown-dark.css";

export default function MarkdownRenderer({ content, className = "" }) {
    return (
        <div className={`markdown-body ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
            >
                {content || ""}
            </ReactMarkdown>
        </div>
    );
}
