import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from './Select';

describe('Select', () => {
  it('renders with options', () => {
    const { container } = render(
      <Select defaultValue="">
        <option value="">Choose...</option>
        <option value="a">Option A</option>
        <option value="b">Option B</option>
      </Select>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(
      <Select disabled>
        <option>None</option>
      </Select>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('fires onChange when selection changes', () => {
    const onChange = vi.fn();
    render(
      <label>
        Pick
        <Select onChange={onChange}>
          <option value="x">X</option>
          <option value="y">Y</option>
        </Select>
      </label>,
    );
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'y' } });
    expect(onChange).toHaveBeenCalledOnce();
  });
});
