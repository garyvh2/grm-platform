import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders with title only', () => {
    const { container } = render(<PageHeader title="My App" />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with title and subtitle', () => {
    const { container } = render(<PageHeader title="My App" subtitle="A great app" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
