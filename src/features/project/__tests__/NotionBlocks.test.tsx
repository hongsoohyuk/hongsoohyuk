import {render, screen} from '@testing-library/react';

import {NotionBlocks} from '../components/NotionBlocks';

import type {NotionBlockWithChildren} from '../types';

describe('NotionBlocks', () => {
  const createBlock = (type: string, content: Record<string, unknown> = {}): NotionBlockWithChildren =>
    ({
      id: `block-${Math.random().toString(36).slice(2)}`,
      type,
      ...content,
    }) as NotionBlockWithChildren;

  describe('paragraph', () => {
    it('renders paragraph block', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('paragraph', {
          paragraph: {
            rich_text: [{plain_text: 'This is a paragraph'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.getByText('This is a paragraph')).toBeInTheDocument();
    });
  });

  describe('headings', () => {
    it('renders heading_1', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('heading_1', {
          heading_1: {
            rich_text: [{plain_text: 'Heading 1'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      const heading = screen.getByRole('heading', {level: 1});
      expect(heading).toHaveTextContent('Heading 1');
    });

    it('renders heading_2', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('heading_2', {
          heading_2: {
            rich_text: [{plain_text: 'Heading 2'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      const heading = screen.getByRole('heading', {level: 2});
      expect(heading).toHaveTextContent('Heading 2');
    });

    it('renders heading_3', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('heading_3', {
          heading_3: {
            rich_text: [{plain_text: 'Heading 3'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      const heading = screen.getByRole('heading', {level: 3});
      expect(heading).toHaveTextContent('Heading 3');
    });
  });

  describe('quote', () => {
    it('renders quote block', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('quote', {
          quote: {
            rich_text: [{plain_text: 'This is a quote'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      const quote = screen.getByText('This is a quote');
      expect(quote.closest('blockquote')).toBeInTheDocument();
    });
  });

  describe('divider', () => {
    it('renders divider', () => {
      const blocks: NotionBlockWithChildren[] = [createBlock('divider')];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.getByRole('separator')).toBeInTheDocument();
    });
  });

  describe('code', () => {
    it('renders code block', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('code', {
          code: {
            rich_text: [{plain_text: 'const x = 1;'}],
            language: 'javascript',
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.getByText('const x = 1;')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });

    it('renders code block without language', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('code', {
          code: {
            rich_text: [{plain_text: 'some code'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.getByText('some code')).toBeInTheDocument();
    });
  });

  describe('callout', () => {
    it('renders callout with emoji', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('callout', {
          callout: {
            icon: {emoji: '💡'},
            rich_text: [{plain_text: 'This is a callout'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.getByText('💡')).toBeInTheDocument();
      expect(screen.getByText('This is a callout')).toBeInTheDocument();
    });
  });

  describe('image', () => {
    it('renders external image', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('image', {
          image: {
            type: 'external',
            external: {url: 'https://example.com/image.png'},
            caption: [{plain_text: 'Image caption'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', 'https://example.com/image.png');
      expect(screen.getByText('Image caption')).toBeInTheDocument();
    });

    it('does not render image without src', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('image', {
          image: {
            type: 'external',
            external: {},
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });

  describe('to_do', () => {
    it('renders unchecked todo', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('to_do', {
          to_do: {
            checked: false,
            rich_text: [{plain_text: 'Todo item'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      expect(screen.getByText('Todo item')).toBeInTheDocument();
    });

    it('renders checked todo', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('to_do', {
          to_do: {
            checked: true,
            rich_text: [{plain_text: 'Completed todo'}],
          },
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('toggle', () => {
    it('renders toggle block', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('toggle', {
          toggle: {
            rich_text: [{plain_text: 'Toggle summary'}],
          },
          children: [
            createBlock('paragraph', {
              paragraph: {
                rich_text: [{plain_text: 'Toggle content'}],
              },
            }),
          ],
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.getByText('Toggle summary')).toBeInTheDocument();
    });
  });

  describe('bulleted_list_item', () => {
    it('groups consecutive bulleted items', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('bulleted_list_item', {
          bulleted_list_item: {rich_text: [{plain_text: 'Item 1'}]},
        }),
        createBlock('bulleted_list_item', {
          bulleted_list_item: {rich_text: [{plain_text: 'Item 2'}]},
        }),
        createBlock('bulleted_list_item', {
          bulleted_list_item: {rich_text: [{plain_text: 'Item 3'}]},
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('UL');

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });
  });

  describe('numbered_list_item', () => {
    it('groups consecutive numbered items', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('numbered_list_item', {
          numbered_list_item: {rich_text: [{plain_text: 'First'}]},
        }),
        createBlock('numbered_list_item', {
          numbered_list_item: {rich_text: [{plain_text: 'Second'}]},
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('OL');
    });
  });

  describe('child_page', () => {
    it('renders child page title', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('child_page', {
          child_page: {title: 'Subpage Title'},
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.getByText(/Subpage Title/)).toBeInTheDocument();
    });
  });

  describe('unsupported blocks', () => {
    it('renders fallback for unknown block type', () => {
      const blocks: NotionBlockWithChildren[] = [createBlock('unknown_type')];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.getByText('[unknown_type]')).toBeInTheDocument();
    });
  });

  describe('nested children', () => {
    it('renders nested children blocks', () => {
      const blocks: NotionBlockWithChildren[] = [
        createBlock('paragraph', {
          paragraph: {
            rich_text: [{plain_text: 'Parent'}],
          },
          children: [
            createBlock('paragraph', {
              paragraph: {
                rich_text: [{plain_text: 'Child'}],
              },
            }),
          ],
        }),
      ];

      render(<NotionBlocks blocks={blocks} />);

      expect(screen.getByText('Parent')).toBeInTheDocument();
      expect(screen.getByText('Child')).toBeInTheDocument();
    });
  });

  describe('empty blocks', () => {
    it('handles empty blocks array', () => {
      const {container} = render(<NotionBlocks blocks={[]} />);
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });
  });
});
