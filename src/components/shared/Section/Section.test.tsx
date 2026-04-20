import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Section } from './Section';

describe('Section', () => {
  it('renders with simple children', () => {
    const { container } = render(<Section heading="Step 1">Content here</Section>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with complex children', () => {
    const { container } = render(
      <Section heading="2. Search">
        <p>Paragraph one</p>
        <p>Paragraph two</p>
      </Section>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
