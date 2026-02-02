import {render, screen} from '@testing-library/react';

import {NotionRichText} from '../ui/notion/NotionRichText';

import type {NotionRichTextItem} from '../ui/notion/NotionRichText';

describe('NotionRichText', () => {
  it('renders plain text', () => {
    const richText: NotionRichTextItem[] = [{plain_text: 'Hello World'}];

    render(<NotionRichText richText={richText} />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('renders bold text', () => {
    const richText: NotionRichTextItem[] = [
      {
        plain_text: 'Bold Text',
        annotations: {bold: true},
      },
    ];

    render(<NotionRichText richText={richText} />);

    const element = screen.getByText('Bold Text');
    expect(element.tagName).toBe('STRONG');
  });

  it('renders italic text', () => {
    const richText: NotionRichTextItem[] = [
      {
        plain_text: 'Italic Text',
        annotations: {italic: true},
      },
    ];

    render(<NotionRichText richText={richText} />);

    const element = screen.getByText('Italic Text');
    expect(element.tagName).toBe('EM');
  });

  it('renders underlined text', () => {
    const richText: NotionRichTextItem[] = [
      {
        plain_text: 'Underlined Text',
        annotations: {underline: true},
      },
    ];

    render(<NotionRichText richText={richText} />);

    const element = screen.getByText('Underlined Text');
    expect(element).toHaveClass('underline');
  });

  it('renders strikethrough text', () => {
    const richText: NotionRichTextItem[] = [
      {
        plain_text: 'Strikethrough Text',
        annotations: {strikethrough: true},
      },
    ];

    render(<NotionRichText richText={richText} />);

    const element = screen.getByText('Strikethrough Text');
    expect(element).toHaveClass('line-through');
  });

  it('renders code text', () => {
    const richText: NotionRichTextItem[] = [
      {
        plain_text: 'code snippet',
        annotations: {code: true},
      },
    ];

    render(<NotionRichText richText={richText} />);

    const element = screen.getByText('code snippet');
    expect(element.tagName).toBe('CODE');
  });

  it('renders links with href attribute', () => {
    const richText: NotionRichTextItem[] = [
      {
        plain_text: 'Click here',
        href: 'https://example.com',
      },
    ];

    render(<NotionRichText richText={richText} />);

    const link = screen.getByRole('link', {name: 'Click here'});
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noreferrer');
  });

  it('renders links from text.link.url', () => {
    const richText: NotionRichTextItem[] = [
      {
        plain_text: 'Nested link',
        text: {link: {url: 'https://nested.example.com'}},
      },
    ];

    render(<NotionRichText richText={richText} />);

    const link = screen.getByRole('link', {name: 'Nested link'});
    expect(link).toHaveAttribute('href', 'https://nested.example.com');
  });

  it('renders multiple annotations on same text', () => {
    const richText: NotionRichTextItem[] = [
      {
        plain_text: 'Bold and Italic',
        annotations: {bold: true, italic: true},
      },
    ];

    render(<NotionRichText richText={richText} />);

    // Text should be wrapped in both <strong> and <em>
    const text = screen.getByText('Bold and Italic');
    expect(text.closest('strong')).toBeInTheDocument();
    expect(text.closest('em')).toBeInTheDocument();
  });

  it('renders multiple text segments', () => {
    const richText: NotionRichTextItem[] = [
      {plain_text: 'Normal '},
      {plain_text: 'Bold', annotations: {bold: true}},
      {plain_text: ' Normal again'},
    ];

    render(<NotionRichText richText={richText} />);

    // Text includes trailing/leading spaces
    expect(screen.getByText('Normal', {exact: false})).toBeInTheDocument();
    expect(screen.getByText('Bold')).toBeInTheDocument();
    expect(screen.getByText('Normal again', {exact: false})).toBeInTheDocument();
  });

  it('returns null for empty array', () => {
    const {container} = render(<NotionRichText richText={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null for undefined', () => {
    const {container} = render(<NotionRichText richText={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('skips items with empty plain_text', () => {
    const richText: NotionRichTextItem[] = [{plain_text: ''}, {plain_text: 'Visible'}];

    render(<NotionRichText richText={richText} />);

    expect(screen.getByText('Visible')).toBeInTheDocument();
  });
});
