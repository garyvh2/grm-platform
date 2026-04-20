import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('renders with children', () => {
    const { container } = render(<Card>Card content</Card>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with extra className', () => {
    const { container } = render(<Card className="flex gap-4">Styled</Card>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with complex children', () => {
    const { container } = render(
      <Card>
        <h3>Title</h3>
        <p>Description</p>
      </Card>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
