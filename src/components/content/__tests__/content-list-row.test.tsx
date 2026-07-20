import {render, screen} from '@testing-library/react';

import {
  ContentListRow,
  ContentListRowDescription,
  ContentListRowHeader,
  ContentListRowSkeleton,
  ContentListRowTitle,
} from '../content-list-row';

// Coverage for the shared list row that replaced the byte-identical blog/project cards.
// Mirrors the intent of the former project-card.test.tsx now that the row lives here.
function Row({title, href = '/project/test-project'}: {title: string; href?: string}) {
  return (
    <ContentListRow>
      <a href={href}>
        <ContentListRowHeader>
          <ContentListRowTitle>{title}</ContentListRowTitle>
        </ContentListRowHeader>
        <ContentListRowDescription>Test Description</ContentListRowDescription>
      </a>
    </ContentListRow>
  );
}

describe('ContentListRow', () => {
  it('renders the title text', () => {
    render(<Row title="Test Project" />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('wraps the caller link (asChild) so the row is the anchor', () => {
    render(<Row title="Test Project" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/project/test-project');
  });

  it('renders the title in an h3 element', () => {
    render(<Row title="Test Project" />);

    const heading = screen.getByRole('heading', {level: 3});
    expect(heading).toHaveTextContent('Test Project');
  });

  it('handles an empty title gracefully', () => {
    render(<Row title="" />);

    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('handles special characters in the title', () => {
    render(<Row title={'Test <Project> & "Quotes"'} />);

    expect(screen.getByText('Test <Project> & "Quotes"')).toBeInTheDocument();
  });
});

describe('ContentListRowSkeleton', () => {
  it('renders a placeholder that reuses the row frame', () => {
    const {container} = render(<ContentListRowSkeleton />);

    expect(container.querySelector('[data-slot="content-list-row-skeleton"]')).toBeInTheDocument();
  });
});
