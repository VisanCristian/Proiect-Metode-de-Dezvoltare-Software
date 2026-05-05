function renderInline(text, keyPrefix) {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g).filter(Boolean);

    return parts.map((part, index) => {
        const key = `${keyPrefix}-${index}`;

        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={key}>{part.slice(2, -2)}</strong>;
        }

        if (part.startsWith("`") && part.endsWith("`")) {
            return <code key={key}>{part.slice(1, -1)}</code>;
        }

        if (part.startsWith("*") && part.endsWith("*")) {
            return <em key={key}>{part.slice(1, -1)}</em>;
        }

        return <span key={key}>{part}</span>;
    });
}

export default function RichTextPreview({ content }) {
    const lines = content.split("\n");
    const blocks = [];
    let paragraphLines = [];
    let listItems = [];
    let codeLines = [];
    let isInsideCodeBlock = false;

    function flushParagraph() {
        if (paragraphLines.length === 0) {
            return;
        }

        const text = paragraphLines.join(" ").trim();
        if (text) {
            blocks.push({ type: "paragraph", text });
        }
        paragraphLines = [];
    }

    function flushList() {
        if (listItems.length === 0) {
            return;
        }

        blocks.push({ type: "list", items: [...listItems] });
        listItems = [];
    }

    function flushCodeBlock() {
        if (codeLines.length === 0) {
            return;
        }

        blocks.push({ type: "code", text: codeLines.join("\n") });
        codeLines = [];
    }

    lines.forEach((line) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("```")) {
            flushParagraph();
            flushList();

            if (isInsideCodeBlock) {
                flushCodeBlock();
            }

            isInsideCodeBlock = !isInsideCodeBlock;
            return;
        }

        if (isInsideCodeBlock) {
            codeLines.push(line);
            return;
        }

        if (!trimmedLine) {
            flushParagraph();
            flushList();
            return;
        }

        const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
        if (headingMatch) {
            flushParagraph();
            flushList();
            blocks.push({
                type: "heading",
                level: headingMatch[1].length,
                text: headingMatch[2],
            });
            return;
        }

        const listMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
        if (listMatch) {
            flushParagraph();
            listItems.push(listMatch[1]);
            return;
        }

        paragraphLines.push(trimmedLine);
    });

    flushParagraph();
    flushList();
    flushCodeBlock();

    return (
        <div className="rendered-content">
            {blocks.map((block, index) => {
                if (block.type === "heading") {
                    const HeadingTag = `h${block.level}`;
                    return <HeadingTag key={`heading-${index}`}>{renderInline(block.text, `heading-${index}`)}</HeadingTag>;
                }

                if (block.type === "list") {
                    return (
                        <ul key={`list-${index}`}>
                            {block.items.map((item, itemIndex) => (
                                <li key={`list-${index}-${itemIndex}`}>{renderInline(item, `list-${index}-${itemIndex}`)}</li>
                            ))}
                        </ul>
                    );
                }

                if (block.type === "code") {
                    return (
                        <pre key={`code-${index}`}>
                            <code>{block.text}</code>
                        </pre>
                    );
                }

                return <p key={`paragraph-${index}`}>{renderInline(block.text, `paragraph-${index}`)}</p>;
            })}
        </div>
    );
}
