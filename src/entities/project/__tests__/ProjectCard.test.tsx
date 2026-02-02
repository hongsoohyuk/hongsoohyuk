import {render, screen} from '@testing-library/react';

import {ProjectCard} from '../ui/ProjectCard';

import type {ProjectListItem} from '../model/types';

// Mock next-intl Link component
jest.mock('@/shared/i18n/routing', () => ({
  Link: ({href, children, className}: {href: string; children: React.ReactNode; className?: string}) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('ProjectCard', () => {
  const mockProject: ProjectListItem = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    slug: '123e4567e89b12d3a456426614174000',
    title: 'Test Project',
  };

  it('renders project title', () => {
    render(<ProjectCard project={mockProject} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('links to project detail page', () => {
    render(<ProjectCard project={mockProject} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/project/${mockProject.slug}`);
  });

  it('renders title in h3 element', () => {
    render(<ProjectCard project={mockProject} />);

    const heading = screen.getByRole('heading', {level: 3});
    expect(heading).toHaveTextContent('Test Project');
  });

  it('handles empty title gracefully', () => {
    const projectWithEmptyTitle: ProjectListItem = {
      ...mockProject,
      title: '',
    };

    render(<ProjectCard project={projectWithEmptyTitle} />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });

  it('handles special characters in title', () => {
    const projectWithSpecialChars: ProjectListItem = {
      ...mockProject,
      title: 'Test <Project> & "Quotes"',
    };

    render(<ProjectCard project={projectWithSpecialChars} />);

    expect(screen.getByText('Test <Project> & "Quotes"')).toBeInTheDocument();
  });
});
