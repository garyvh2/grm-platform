import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileInput } from './FileInput';

describe('FileInput', () => {
  it('renders without fileName', () => {
    const { container } = render(<FileInput label="Music Contracts" onChange={vi.fn()} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with fileName', () => {
    const { container } = render(
      <FileInput label="Music Contracts" fileName="data.txt" onChange={vi.fn()} />,
    );
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders with accept attribute', () => {
    const { container } = render(<FileInput label="Upload" accept=".csv" onChange={vi.fn()} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('fires onChange when file is selected', () => {
    const onChange = vi.fn();
    render(<FileInput label="Upload" onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/upload/i), { target: { files: [] } });
    expect(onChange).toHaveBeenCalledOnce();
  });
});
