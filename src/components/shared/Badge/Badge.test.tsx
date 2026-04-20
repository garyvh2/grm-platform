import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders with text content', () => {
    const { container } = render(<Badge>streaming</Badge>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with multi-word content', () => {
    const { container } = render(<Badge>digital download</Badge>);
    expect(container.firstChild).toMatchSnapshot();
  });
});
