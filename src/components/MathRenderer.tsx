import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  block?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  className = '',
  block = false,
}) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // If block is explicitly requested and content does not already have delimiters
    if (block && !content.includes('$')) {
      try {
        return katex.renderToString(content, {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return content;
      }
    }

    // Check if content contains LaTeX delimiters: $$...$$ or $...$ or \(...\)
    const hasMathDelimiters = /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\(.+?\\\)|\\\[.+?\\\]/.test(content);

    if (!hasMathDelimiters) {
      // Check if it looks like pure LaTeX formula (contains \, ^, _, \frac, etc.)
      const looksLikePureFormula = /\\(frac|sqrt|cdot|times|pm|in|subset|sum|int|lim|alpha|beta|pi|le|ge|neq|approx|mathbf|text)|[\^_{}]/.test(content);
      if (looksLikePureFormula) {
        try {
          return katex.renderToString(content, {
            displayMode: block,
            throwOnError: false,
          });
        } catch {
          return content;
        }
      }
      return escapeHtml(content);
    }

    // Parse mixed text with math
    // 1. Replace $$...$$ block math
    let processed = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return `<div class="my-2 overflow-x-auto print:overflow-visible flex justify-center">${katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        })}</div>`;
      } catch {
        return `$$${math}$$`;
      }
    });

    // 2. Replace \[...\] block math
    processed = processed.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
      try {
        return `<div class="my-2 overflow-x-auto print:overflow-visible flex justify-center">${katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        })}</div>`;
      } catch {
        return `\\[${math}\\]`;
      }
    });

    // 3. Replace $...$ inline math
    processed = processed.replace(/\$([^$\n]+?)\$/g, (_, math) => {
      try {
        return `<span class="inline-math px-0.5">${katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        })}</span>`;
      } catch {
        return `$${math}$`;
      }
    });

    // 4. Replace \(...\) inline math
    processed = processed.replace(/\\\((.+?)\\\)/g, (_, math) => {
      try {
        return `<span class="inline-math px-0.5">${katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        })}</span>`;
      } catch {
        return `\\(${math}\\)`;
      }
    });

    // Preserve newlines for plain paragraphs
    return processed.replace(/\n/g, '<br />');
  }, [content, block]);

  return (
    <div
      className={`math-content leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br />');
}
