import { memo, useState } from 'react';
import { Card, FileInput } from '../shared';

interface FileUploadProps {
  onMusicContractsLoaded: (text: string) => void;
  onPartnerContractsLoaded: (text: string) => void;
}

/**
 * Provides two file-input fields for uploading music and partner contract data.
 *
 * Wrapped in `React.memo` — skips re-rendering when parent state changes
 * (e.g., search results update) as long as the callback props are stable.
 */
export const FileUpload = memo(function FileUpload({
  onMusicContractsLoaded,
  onPartnerContractsLoaded,
}: FileUploadProps) {
  const [musicFileName, setMusicFileName] = useState('');
  const [partnerFileName, setPartnerFileName] = useState('');

  const createFileHandler =
    (onLoaded: (text: string) => void, setName: (name: string) => void) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        setName(file.name);
        onLoaded(reader.result as string);
      };
      reader.readAsText(file);
    };

  return (
    <Card className="flex gap-8">
      <FileInput
        label="Music Contracts"
        accept=".txt"
        fileName={musicFileName}
        onChange={createFileHandler(onMusicContractsLoaded, setMusicFileName)}
      />
      <FileInput
        label="Partner Contracts"
        accept=".txt"
        fileName={partnerFileName}
        onChange={createFileHandler(onPartnerContractsLoaded, setPartnerFileName)}
      />
    </Card>
  );
});
