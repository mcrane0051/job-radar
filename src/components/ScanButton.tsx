import React from 'react';

interface ScanButtonProps {
  isScanning: boolean;
  onScan: () => void;
  lastScannedAt?: string;
}

export const ScanButton: React.FC<ScanButtonProps> = ({ isScanning, onScan, lastScannedAt }) => {
  return (
    <div className="flex items-center gap-4">
      {lastScannedAt && (
        <span className="text-sm text-gray-400">
          Last scanned: {new Date(lastScannedAt).toLocaleTimeString()}
        </span>
      )}
      <button
        onClick={onScan}
        disabled={isScanning}
        className="relative overflow-hidden rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-blue-500 disabled:bg-blue-800 disabled:text-blue-300 disabled:cursor-not-allowed"
      >
        {isScanning ? (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Scanning Web...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Scan for Jobs
          </span>
        )}
      </button>
    </div>
  );
};
