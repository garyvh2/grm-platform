interface FileInputProps {
  /** Label text for the file input (e.g. "Music Contracts"). */
  label: string;
  /** Accepted file extensions (e.g. ".txt"). */
  accept?: string;
  /** Name of the currently selected file, displayed below the input. */
  fileName?: string;
  /** Called when the user selects a file. */
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

/** Labeled file input with styled button and optional filename display. */
export function FileInput({ label, accept, fileName, onChange }: FileInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
        {label}
        <input
          type="file"
          accept={accept}
          className="text-sm text-slate-500 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white file:transition hover:file:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:outline-none"
          onChange={onChange}
        />
      </label>
      {fileName && <span className="text-xs text-slate-500 italic">{fileName}</span>}
    </div>
  );
}
