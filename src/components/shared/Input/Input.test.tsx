import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input, CONTROL_CLASSES } from './Input';

describe('Input', () => {
  it('renders a text input', () => {
    const { container } = render(<Input type="text" placeholder="Type..." />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a date input', () => {
    const { container } = render(<Input type="date" value="2024-01-01" readOnly />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(<Input disabled />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('fires onChange on user input', () => {
    const onChange = vi.fn();
    render(
      <label>
        Name
        <Input type="text" onChange={onChange} />
      </label>,
    );
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('exports CONTROL_CLASSES constant for reuse', () => {
    expect(CONTROL_CLASSES).toContain('rounded-md');
    expect(CONTROL_CLASSES).toContain('focus-visible:border-indigo-500');
    expect(CONTROL_CLASSES).toContain('focus-visible:ring-2');
  });
});
