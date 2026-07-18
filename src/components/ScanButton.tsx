import React from 'react';

interface ScanButtonProps {
  isScanning: boolean;
  onScan: () => void;
  lastScannedAt?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export const ScanButton: React.FC<ScanButtonProps> = ({ isScanning, onScan, lastScannedAt, disabled, disabledReason }) => {
  const getNextScanTime = () => {
    const currentEst = new Date(new Date().toLocaleString("en-US", {timeZone: "America/New_York"}));
    const h = currentEst.getHours();
    
    if (h < 7) return "7:00 AM EST";
    if (h < 15) return "3:00 PM EST";
    return "7:00 AM EST";
  };

  const formatLastScanned = (dateString?: string) => {
    if (!dateString) return "NEVER";
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase() + ' EST';
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "YESTERDAY";
    if (diffDays <= 5) return `${diffDays} DAYS AGO`;
    
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  };

  return (
    <div
      className="flex items-center"
      style={{ gap: 'var(--spacing-16)' }}
    >
      {/* Metadata */}
      <div
        className="flex flex-col items-end"
        style={{
          gap: '2px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          lineHeight: '16px',
          color: 'var(--text-secondary)',
        }}
      >
        <span>LAST SCAN: {formatLastScanned(lastScannedAt)}</span>
        <span>NEXT SCAN: {getNextScanTime().toUpperCase()}</span>
      </div>

    </div>
  );
};
