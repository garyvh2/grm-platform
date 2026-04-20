import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders message', () => {
    const { container } = render(<EmptyState message="No matching contracts found" />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
