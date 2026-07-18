import React, { useState, useEffect } from 'react';
import { IconButton } from './IconButton';

import { Button } from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [geminiKey, setGeminiKey] = useState('');
  const [hunterKey, setHunterKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGeminiKey(window.localStorage.getItem('gemini-api-key') || '');
      setHunterKey(window.localStorage.getItem('hunter-api-key') || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (geminiKey.trim()) {
      window.localStorage.setItem('gemini-api-key', geminiKey.trim());
    } else {
      window.localStorage.removeItem('gemini-api-key');
    }

    if (hunterKey.trim()) {
      window.localStorage.setItem('hunter-api-key', hunterKey.trim());
    } else {
      window.localStorage.removeItem('hunter-api-key');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
        style={{ 
          backgroundColor: 'var(--surface-2)',
          border: '1px solid var(--border-color)'
        }}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>API Settings</h2>
          <IconButton onClick={onClose} aria-label="Close settings">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </IconButton>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your API keys are stored securely in your browser's local storage and are never sent to our servers.
          </p>

          <div className="space-y-4">
            <div>
              <label htmlFor="gemini-key" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Gemini API Key
              </label>
              <input
                id="gemini-key"
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-md font-mono text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--surface-3)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div>
              <label htmlFor="hunter-key" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Hunter.io API Key
              </label>
              <input
                id="hunter-key"
                type="password"
                value={hunterKey}
                onChange={(e) => setHunterKey(e.target.value)}
                placeholder="6a936..."
                className="w-full px-3 py-2 rounded-md font-mono text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--surface-3)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 sm:p-6 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-3)' }}>
          <Button 
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            variant="primary"
            onClick={handleSave}
          >
            Save Keys
          </Button>
        </div>
      </div>
    </div>
  );
};
