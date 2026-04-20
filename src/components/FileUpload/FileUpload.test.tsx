import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FileUpload } from './FileUpload';

describe('FileUpload', () => {
  it('renders two labeled file inputs', () => {
    render(<FileUpload onMusicContractsLoaded={vi.fn()} onPartnerContractsLoaded={vi.fn()} />);
    expect(screen.getByLabelText(/music contracts/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/partner contracts/i)).toBeInTheDocument();

    const inputs = screen.getAllByDisplayValue('');
    const fileInputs = inputs.filter(
      (el) => el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'file',
    );
    expect(fileInputs.length).toBe(2);
  });

  it('calls onMusicContractsLoaded after file upload', async () => {
    const onMusicLoaded = vi.fn();
    const onPartnerLoaded = vi.fn();

    const readAsTextMock = vi.fn();
    let capturedOnload: (() => void) | null = null;

    const OriginalFileReader = globalThis.FileReader;
    globalThis.FileReader = class MockFileReader {
      result = 'file content here';
      onload: (() => void) | null = null;
      readAsText(file: Blob) {
        readAsTextMock(file);
        capturedOnload = this.onload;
      }
    } as unknown as typeof FileReader;

    render(
      <FileUpload
        onMusicContractsLoaded={onMusicLoaded}
        onPartnerContractsLoaded={onPartnerLoaded}
      />,
    );

    const file = new File(['file content here'], 'music.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/music contracts/i);

    fireEvent.change(input, { target: { files: [file] } });

    expect(readAsTextMock).toHaveBeenCalledWith(file);
    capturedOnload!();

    expect(onMusicLoaded).toHaveBeenCalledWith('file content here');
    expect(onPartnerLoaded).not.toHaveBeenCalled();

    globalThis.FileReader = OriginalFileReader;
  });
});
