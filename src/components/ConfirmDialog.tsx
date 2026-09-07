import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog-content card">
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.25rem', textTransform: 'none' }}>{title}</h3>
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn" onClick={onCancel} style={{ backgroundColor: '#f1f5f9', color: 'var(--text-main)' }}>Cancel</button>
          <button className="btn" onClick={onConfirm} style={{ backgroundColor: 'var(--error)', color: 'white' }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
