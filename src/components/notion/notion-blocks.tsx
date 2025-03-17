import React from 'react';

import type {BlockObjectResponse} from '@notionhq/client/build/src/api-endpoints';

import type {NotionBlockWithChildren} from '@/types/notion';
import {cn} from '@/utils/style';

import {BLOCK_RENDERERS} from './blocks';
import {NotionRichText} from './notion-rich-text';

type NarrowBlock<T extends BlockObjectResponse['type']> = Extract<BlockObjectResponse, {type: T}> & {
  children?: NotionBlockWithChildren[];
};

type Props = {
  blocks: NotionBlockWithChildren[];
  className?: string;
};

function BlockChildren({block}: {block: NotionBlockWithChildren}) {
  if (!Array.isArray(block.children) || block.children.length === 0) return null;
  return <NotionBlocks blocks={block.children} className="mt-3" />;
}

function renderChildren(block: NotionBlockWithChildren): React.ReactNode {
  return <BlockChildren block={block} />;
}

function renderBlocks(blocks: NotionBlockWithChildren[], className?: string): React.ReactNode {
  return <NotionBlocks blocks={blocks} className={className} />;
}

function NotionBlock({
  block,
  allBlocks,
}: {
  block: NotionBlockWithChildren;
  allBlocks?: NotionBlockWithChildren[];
}): React.ReactNode {
  const Renderer = BLOCK_RENDERERS[block.type];
  if (!Renderer) {
    return <div className="text-sm text-muted-foreground">[{block.type}]</div>;
  }
  return <Renderer block={block} allBlocks={allBlocks} renderChildren={renderChildren} renderBlocks={renderBlocks} />;
}

function groupListItems(blocks: NotionBlockWithChildren[]): React.ReactNode[] {
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
      i--;

      nodes.push(
        <ul key={`ul-${items[0]?.id ?? i}`} className="list-disc pl-4 space-y-2">
          {items.map((it) => (
            <li key={it.id} className="leading-7">
              <NotionRichText richText={(it as NarrowBlock<'bulleted_list_item'>).bulleted_list_item.rich_text} />
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
              <NotionRichText richText={(it as NarrowBlock<'numbered_list_item'>).numbered_list_item.rich_text} />
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

  return nodes;
}

export function NotionBlocks({blocks, className}: Props) {
  return <div className={cn('space-y-4', className)}>{groupListItems(blocks)}</div>;
}
