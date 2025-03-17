import type {NotionRichTextItem} from '../notion-rich-text';

export function richTextToPlain(richText: NotionRichTextItem[] | undefined): string {
  return (richText ?? []).map((t) => t?.plain_text ?? '').join('');
}

export function extractCaption(caption: NotionRichTextItem[] | undefined): string {
  return richTextToPlain(caption);
}
