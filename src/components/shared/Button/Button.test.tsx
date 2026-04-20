import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders default state', () => {
    const { container } = render(<Button>Search</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders disabled state', () => {
    const { container } = render(<Button disabled>Search</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with type=submit', () => {
    const { container } = render(<Button type="submit">Send</Button>);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('fires onClick handler', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        No
      </Button>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
