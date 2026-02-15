import React from 'react';

import type {NotionBlockWithChildren} from '@/types/notion';
import {cn} from '@/utils/style';

import {NotionRichText} from './notion-rich-text';

type Props = {
  blocks: NotionBlockWithChildren[];
  className?: string;
};

function getPlainText(richText: any[]): string {
  return (richText ?? []).map((t: any) => t?.plain_text ?? '').join('');
}

function collectHeadings(blocks: NotionBlockWithChildren[]): {id: string; text: string; level: number}[] {
  const headings: {id: string; text: string; level: number}[] = [];
  for (const b of blocks) {
    if (b.type === 'heading_1') headings.push({id: b.id, text: getPlainText(b.heading_1?.rich_text), level: 1});
    else if (b.type === 'heading_2') headings.push({id: b.id, text: getPlainText(b.heading_2?.rich_text), level: 2});
    else if (b.type === 'heading_3') headings.push({id: b.id, text: getPlainText(b.heading_3?.rich_text), level: 3});
  }
  return headings;
}

function BlockChildren({block}: {block: NotionBlockWithChildren}) {
  if (!Array.isArray(block.children) || block.children.length === 0) return null;
  return <NotionBlocks blocks={block.children} className="mt-3" />;
}

function NotionBlock({
  block,
  allBlocks,
}: {
  block: NotionBlockWithChildren;
  allBlocks?: NotionBlockWithChildren[];
}): React.ReactNode {
  switch (block.type) {
    case 'paragraph':
      return (
        <div className="space-y-2">
          <p className="leading-7 text-foreground">
            <NotionRichText richText={block.paragraph?.rich_text} />
          </p>
          <BlockChildren block={block} />
        </div>
      );
    case 'heading_1':
      return (
        <div className="space-y-2">
          <h1 id={block.id} className="text-3xl font-bold tracking-tight text-wrap-balance scroll-mt-20">
            <NotionRichText richText={block.heading_1?.rich_text} />
          </h1>
          <BlockChildren block={block} />
        </div>
      );
    case 'heading_2':
      return (
        <div className="space-y-2">
          <h2 id={block.id} className="text-2xl font-semibold tracking-tight text-wrap-balance scroll-mt-20">
            <NotionRichText richText={block.heading_2?.rich_text} />
          </h2>
          <BlockChildren block={block} />
        </div>
      );
    case 'heading_3':
      return (
        <div className="space-y-2">
          <h3 id={block.id} className="text-xl font-semibold tracking-tight text-wrap-balance scroll-mt-20">
            <NotionRichText richText={block.heading_3?.rich_text} />
          </h3>
          <BlockChildren block={block} />
        </div>
      );
    case 'quote':
      return (
        <div className="space-y-2">
          <blockquote className="border-l-2 pl-4 italic text-foreground/70">
            <NotionRichText richText={block.quote?.rich_text} />
          </blockquote>
          <BlockChildren block={block} />
        </div>
      );
    case 'divider':
      return <hr className="my-6 border-border" />;
    case 'code': {
      const codeText = (block.code?.rich_text ?? []).map((t: any) => t?.plain_text ?? '').join('');
      const language = block.code?.language ? String(block.code.language) : '';
      return (
        <div className="space-y-2">
          {language ? <div className="text-xs text-muted-foreground">{language}</div> : null}
          <pre className="overflow-x-auto rounded-md bg-muted border border-border p-4 text-sm">
            <code>{codeText}</code>
          </pre>
          <BlockChildren block={block} />
        </div>
      );
    }
    case 'callout': {
      const calloutIcon = block.callout?.icon;
      const icon = calloutIcon && 'emoji' in calloutIcon ? calloutIcon.emoji : '';
      return (
        <div className="rounded-md border bg-muted/70 p-4">
          <div className="flex gap-3 items-baseline">
            {icon ? <div className="text-lg leading-none shrink-0">{icon}</div> : null}
            <div className="min-w-0 space-y-2">
              <NotionRichText richText={block.callout?.rich_text} />
              <BlockChildren block={block} />
            </div>
          </div>
        </div>
      );
    }
    case 'image': {
      const image = block.image;
      const src = image?.type === 'external' ? image.external?.url : image?.file?.url;
      const caption = (image?.caption ?? []).map((t: any) => t?.plain_text ?? '').join('');
      if (!src) return null;
      return (
        <figure className="space-y-2">
          {/* Notion file URLs can expire; use <img> to avoid Next Image domain constraints */}
          <img src={src} alt={caption || 'Notion image'} className="max-w-full rounded-md border" loading="lazy" />
          {caption ? <figcaption className="text-sm text-muted-foreground">{caption}</figcaption> : null}
          <BlockChildren block={block} />
        </figure>
      );
    }
    case 'to_do': {
      const checked = Boolean(block.to_do?.checked);
      return (
        <div className="space-y-2">
          <label className="flex items-start gap-2">
            <input type="checkbox" checked={checked} readOnly className="mt-1" />
            <span className={cn(checked && 'line-through text-muted-foreground')}>
              <NotionRichText richText={block.to_do?.rich_text} />
            </span>
          </label>
          <BlockChildren block={block} />
        </div>
      );
    }
    case 'toggle': {
      const summary = block.toggle?.rich_text ?? [];
      return (
        <details className="rounded-md border p-3">
          <summary className="cursor-pointer select-none">
            <NotionRichText richText={summary} />
          </summary>
          <div className="mt-3">
            <BlockChildren block={block} />
          </div>
        </details>
      );
    }
    case 'video': {
      const video = block.video;
      const src = video?.type === 'external' ? video.external?.url : video?.file?.url;
      const caption = (video?.caption ?? []).map((t: any) => t?.plain_text ?? '').join('');
      if (!src) return null;
      return (
        <figure className="space-y-2">
          <video src={src} controls className="max-w-full rounded-md border" preload="metadata">
            Your browser does not support the video tag.
          </video>
          {caption ? <figcaption className="text-sm text-muted-foreground">{caption}</figcaption> : null}
          <BlockChildren block={block} />
        </figure>
      );
    }
    case 'column_list': {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.isArray(block.children) &&
            block.children.map((col) => (
              <div key={col.id} className="min-w-0">
                {Array.isArray(col.children) && col.children.length > 0 ? <NotionBlocks blocks={col.children} /> : null}
              </div>
            ))}
        </div>
      );
    }
    case 'column': {
      return Array.isArray(block.children) && block.children.length > 0 ? (
        <NotionBlocks blocks={block.children} />
      ) : null;
    }
    case 'bookmark': {
      const url = block.bookmark?.url ?? '';
      const caption = (block.bookmark?.caption ?? []).map((t: any) => t?.plain_text ?? '').join('');
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-md border p-3 text-sm text-primary underline underline-offset-4 hover:bg-muted/40 transition-colors"
        >
          {caption || url}
        </a>
      );
    }
    case 'link_preview': {
      const url = block.link_preview?.url ?? '';
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-md border p-3 text-sm text-primary underline underline-offset-4 hover:bg-muted/40 transition-colors"
        >
          {url}
        </a>
      );
    }
    case 'table': {
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {Array.isArray(block.children) &&
                block.children.map((row, rowIdx) => (
                  <tr key={row.id} className={rowIdx === 0 && block.table?.has_column_header ? 'font-semibold' : ''}>
                    {Array.isArray(row.table_row?.cells) &&
                      row.table_row.cells.map((cell: any[], cellIdx: number) => {
                        const Tag = rowIdx === 0 && block.table?.has_column_header ? 'th' : 'td';
                        return (
                          <Tag key={cellIdx} className="border px-3 py-2 text-left">
                            <NotionRichText richText={cell} />
                          </Tag>
                        );
                      })}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'table_row':
      return null;
    case 'child_page': {
      const title = block.child_page?.title ?? 'Untitled';
      return <div className="text-sm text-muted-foreground">📄 {title}</div>;
    }
    case 'table_of_contents': {
      const headings = collectHeadings(allBlocks ?? []);
      if (headings.length === 0) return null;
      const minLevel = Math.min(...headings.map((h) => h.level));
      return (
        <nav className="rounded-md border border-border/50 bg-muted/30 p-4">
          <ul className="space-y-1.5 text-sm">
            {headings.map((h) => (
              <li key={h.id} style={{paddingLeft: `${(h.level - minLevel) * 16}px`}}>
                <a href={`#${h.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      );
    }
    default:
      // Fallback: show the type so the page doesn't look empty for unsupported blocks
      return <div className="text-sm text-muted-foreground">[{block.type}]</div>;
  }
}

export function NotionBlocks({blocks, className}: Props) {
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block) continue;

    if (block.type === 'bulleted_list_item') {
      const items: NotionBlockWithChildren[] = [];
      while (i < blocks.length && blocks[i]?.type === 'bulleted_list_item') {
        items.push(blocks[i]);
        i++;
      }
      i--; // compensate for loop increment

      nodes.push(
        <ul key={`ul-${items[0]?.id ?? i}`} className="list-disc pl-4 space-y-2">
          {items.map((it) => (
            <li key={it.id} className="leading-7">
              <NotionRichText richText={it.bulleted_list_item?.rich_text} />
              {Array.isArray(it.children) && it.children.length > 0 ? (
                <NotionBlocks blocks={it.children} className="mt-2" />
              ) : null}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (block.type === 'numbered_list_item') {
      const items: NotionBlockWithChildren[] = [];
      while (i < blocks.length && blocks[i]?.type === 'numbered_list_item') {
        items.push(blocks[i]);
        i++;
      }
      i--;

      nodes.push(
        <ol key={`ol-${items[0]?.id ?? i}`} className="list-decimal pl-4 space-y-2">
          {items.map((it) => (
            <li key={it.id} className="leading-7">
              <NotionRichText richText={it.numbered_list_item?.rich_text} />
              {Array.isArray(it.children) && it.children.length > 0 ? (
                <NotionBlocks blocks={it.children} className="mt-2" />
              ) : null}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    nodes.push(
      <div key={block.id} className="space-y-2">
        <NotionBlock block={block} allBlocks={blocks} />
      </div>,
    );
  }

  return <div className={cn('space-y-4', className)}>{nodes}</div>;
}
