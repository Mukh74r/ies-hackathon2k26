/**
 * Preprocesses AI-generated text so KaTeX/remarkMath can render it correctly.
 *
 * LLMs typically output math in these formats:
 *   \( ... \)      → inline (convert to $ ... $)
 *   \[ ... \]      → block  (convert to $$ ... $$)
 *   $ ... $        → already inline (keep)
 *   $$ ... $$      → already block  (keep)
 *   \frac{}{}, etc → bare commands  (wrap with $ ... $)
 *   `backtick math` → sometimes used (keep as-is, ReactMarkdown handles code)
 */
export const preprocessLatex = (content: string): string => {
    if (!content || typeof content !== 'string') return '';

    let result = content;

    // ── Step 1: Protect already-existing $…$ and $$…$$ sections ──────────────
    // We replace them with placeholders, do all other transforms, then restore.
    const mathPlaceholders: string[] = [];
    const placeholder = (i: number) => `\x00MATH${i}\x00`;

    // Protect $$ blocks first (order matters)
    result = result.replace(/\$\$[\s\S]*?\$\$/g, (m) => {
        mathPlaceholders.push(m);
        return placeholder(mathPlaceholders.length - 1);
    });
    // Protect $ inline blocks
    result = result.replace(/\$[^$\n]+?\$/g, (m) => {
        mathPlaceholders.push(m);
        return placeholder(mathPlaceholders.length - 1);
    });

    // ── Step 2: Convert LLM delimiters ───────────────────────────────────────
    // \[ ... \] → $$ ... $$
    result = result.replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_m, inner) => `$$${inner}$$`);
    // \( ... \) → $ ... $
    result = result.replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_m, inner) => `$${inner}$`);

    // ── Step 3: Wrap bare LaTeX commands ─────────────────────────────────────
    // Matches \command or \command{...}{...} that aren't already in placeholders
    const MATH_CMD = /\\(?:frac|sqrt|sum|int|prod|lim|infty|partial|nabla|hbar|forall|exists|iff|implies|to|rightarrow|leftarrow|Rightarrow|Leftarrow|leftrightarrow|alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|pi|varpi|rho|varrho|sigma|varsigma|tau|upsilon|phi|varphi|chi|psi|omega|Alpha|Beta|Gamma|Delta|Theta|Lambda|Pi|Sigma|Phi|Psi|Omega|vec|hat|bar|dot|ddot|tilde|overline|underline|underbrace|overbrace|overrightarrow|overleftarrow|widehat|widetilde|mathbf|mathrm|mathit|mathbb|mathcal|text|operatorname|left|right|cdot|ldots|dots|pm|mp|times|div|leq|geq|neq|approx|equiv|sim|simeq|cong|propto|in|notin|ni|subset|supset|subseteq|supseteq|cup|cap|emptyset|setminus|land|lor|lnot|oplus|otimes|boxed|begin|end|pmatrix|bmatrix|vmatrix|matrix|cases|log|ln|sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|sinh|cosh|tanh|det|dim|ker|deg|gcd|lcm|max|min|sup|inf|arg|exp|Re|Im)(?:\{[^}]*\}|\[[^\]]*\]|[a-zA-Z_^]?)*/g;

    result = result.replace(MATH_CMD, (match) => `$${match}$`);

    // ── Step 4: Restore placeholders ─────────────────────────────────────────
    result = result.replace(/\x00MATH(\d+)\x00/g, (_m, i) => mathPlaceholders[Number(i)]);

    // ── Step 5: Cleanup ───────────────────────────────────────────────────────
    // Merge adjacent inline math: $A$$B$ → $AB$  (not quite right, leave doubled $$)
    // Collapse accidental quadruple $$$$
    result = result.replace(/\$\$\$\$/g, '$$$$');
    // Fix $$ $$ with only whitespace → remove
    result = result.replace(/\$\$\s*\$\$/g, '');

    return result;
};
