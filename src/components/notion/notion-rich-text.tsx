import React from 'react';

export type NotionRichTextItem = {
  plain_text?: string;
  href?: string | null;
  text?: {link?: {url?: string | null} | null} | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    color?: string;
  };
  [key: string]: any;
};

type Props = {
  richText: NotionRichTextItem[] | undefined;
};

/**
 * Renders Notion rich_text with annotations (bold/italic/underline/strike/code + links).
 * Matches the Notion API shape used across blocks and property values.
 */
export function NotionRichText({richText}: Props) {
  if (!Array.isArray(richText) || richText.length === 0) return null;

  return (
    <>
      {richText.map((rt, idx) => {
        const text = rt?.plain_text ?? '';
        if (!text) return null;

        const annotations = rt?.annotations ?? {};
        const isCode = Boolean(annotations.code);
        const isBold = Boolean(annotations.bold);
        const isItalic = Boolean(annotations.italic);
        const isUnderline = Boolean(annotations.underline);
        const isStrike = Boolean(annotations.strikethrough);

        const href = rt?.href ?? rt?.text?.link?.url ?? null;

        let node: React.ReactNode = text;
        if (isCode) node = <code className="px-1 py-0.5 rounded bg-muted text-sm">{node}</code>;
        if (isBold) node = <strong>{node}</strong>;
        if (isItalic) node = <em>{node}</em>;
        if (isUnderline) node = <span className="underline">{node}</span>;
        if (isStrike) node = <span className="line-through">{node}</span>;
        if (href) {
          node = (
            <a href={href} className="underline underline-offset-4" target="_blank" rel="noreferrer">
              {node}
            </a>
          );
        }

        return <React.Fragment key={`${rt?.type ?? 'rt'}-${idx}`}>{node}</React.Fragment>;
      })}
    </>
  );
}
