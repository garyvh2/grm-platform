import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders label wrapping a text input', () => {
    const { container } = render(
      <FormField label="Name">
        <input type="text" />
      </FormField>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders label wrapping multiple children', () => {
    const { container } = render(
      <FormField label="Combo">
        <input type="text" />
        <span>Helper text</span>
      </FormField>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
