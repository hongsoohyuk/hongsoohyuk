import type {ComponentType} from 'react';

import {BookmarkBlock, LinkPreviewBlock} from './bookmark';
import {CalloutBlock} from './callout';
import {CodeBlock} from './code';
import {ColumnBlock, ColumnListBlock} from './column';
import {HeadingBlock} from './heading';
import {ImageBlock} from './image';
import {ChildPageBlock, DividerBlock, TableOfContentsBlock, TableRowBlock} from './misc';
import {ParagraphBlock} from './paragraph';
import {QuoteBlock} from './quote';
import {TableBlock} from './table';
import {TodoBlock} from './todo';
import {ToggleBlock} from './toggle';
import type {BlockProps} from './types';
import {VideoBlock} from './video';

export type {BlockProps} from './types';

export const BLOCK_RENDERERS: Record<string, ComponentType<BlockProps>> = {
  paragraph: ParagraphBlock,
  heading_1: HeadingBlock,
  heading_2: HeadingBlock,
  heading_3: HeadingBlock,
  quote: QuoteBlock,
  divider: DividerBlock,
  code: CodeBlock,
  callout: CalloutBlock,
  image: ImageBlock,
  to_do: TodoBlock,
  toggle: ToggleBlock,
  video: VideoBlock,
  column_list: ColumnListBlock,
  column: ColumnBlock,
  bookmark: BookmarkBlock,
  link_preview: LinkPreviewBlock,
  table: TableBlock,
  table_row: TableRowBlock,
  child_page: ChildPageBlock,
  table_of_contents: TableOfContentsBlock,
};
