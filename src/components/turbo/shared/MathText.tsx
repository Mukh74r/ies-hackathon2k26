import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { preprocessLatex } from '../../../utils/math';

interface MathTextProps {
    /** The content to render (may contain LaTeX, Markdown, or plain text) */
    children: string;
    /** Extra className for the wrapping span */
    className?: string;
    /** If true, renders as a block-level div instead of inline span */
    block?: boolean;
    /** Optional prose styling class override */
    proseClass?: string;
}

/**
 * MathText — universal math+markdown renderer.
 *
 * Usage:
 *   <MathText>{someAIContent}</MathText>
 *   <MathText block>{longParagraph}</MathText>
 *
 * Features:
 *   - Runs preprocessLatex to normalise all LLM LaTeX delimiter variants
 *   - Uses react-markdown + remark-math + rehype-katex for rendering
 *   - Wraps in either a span (inline) or div (block)
 *   - Applies sensible default prose styling
 */
const MathText: React.FC<MathTextProps> = ({
    children,
    className = '',
    block = false,
    proseClass = 'prose prose-invert max-w-none prose-p:my-0 prose-headings:my-1',
}) => {
    const processed = preprocessLatex(children || '');
    const Wrapper = block ? 'div' : 'span';

    return (
        <Wrapper className={`${proseClass} ${className}`.trim()}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex as any]}
            >
                {processed}
            </ReactMarkdown>
        </Wrapper>
    );
};

export default MathText;
