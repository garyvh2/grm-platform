import { memo } from 'react';
import type { SearchParams } from '../../types';
import { Button, Card, FormField, Input, Select } from '../shared';

interface SearchPanelProps {
  partnerNames: string[];
  selectedPartner: string;
  effectiveDate: string;
  onPartnerChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onSearch: (params: SearchParams) => void;
  disabled?: boolean;
}

/**
 * Form controls for selecting a distribution partner and effective date.
 *
 * State is lifted to the parent so values survive remounts. Wrapped in
 * `React.memo` — skips re-rendering when unrelated parent state changes.
 */
export const SearchPanel = memo(function SearchPanel({
  partnerNames,
  selectedPartner,
  effectiveDate,
  onPartnerChange,
  onDateChange,
  onSearch,
  disabled = false,
}: SearchPanelProps) {
  const canSearch = !disabled && selectedPartner !== '' && effectiveDate !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSearch) {
      onSearch({ partnerName: selectedPartner, effectiveDate });
    }
  };

  return (
    <form role="search" action="" aria-label="Contract search" onSubmit={handleSubmit}>
      <Card className="flex items-end gap-4">
        <FormField label="Partner">
          <Select value={selectedPartner} onChange={(e) => onPartnerChange(e.target.value)}>
            <option value="">Select partner...</option>
            {partnerNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Effective Date">
          <Input type="date" value={effectiveDate} onChange={(e) => onDateChange(e.target.value)} />
        </FormField>

        <Button type="submit" disabled={!canSearch}>
          Search
        </Button>
      </Card>
    </form>
  );
});
