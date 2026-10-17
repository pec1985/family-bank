'use client';

import type { ReactNode } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

type PinDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onComplete: (pin: string) => void;
  onClose: () => void;
  busy: boolean;
  error: string;
};

export default function PinDialog({
  open,
  title,
  children,
  value,
  onChange,
  onComplete,
  onClose,
  busy,
  error,
}: PinDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      fullWidth
      PaperProps={{ className: 'rounded-dialog' }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {children}
        </Typography>
        <PinKeypad value={value} onChange={onChange} onComplete={onComplete} disabled={busy} />
        {busy && <Typography role="status">Comprobando…</Typography>}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function PinKeypad({
  value,
  onChange,
  onComplete,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete: (pin: string) => void;
  disabled: boolean;
}) {
  const add = (digit: string) => {
    if (disabled) return;
    const next = value.length === 4 ? digit : value + digit;
    onChange(next);
    if (next.length === 4) onComplete(next);
  };
  return (
    <div className="pin-keypad" aria-label="Teclado numérico para el PIN">
      <div className="pin-dots" aria-label={`${value.length} de 4 cifras`} aria-live="polite">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i < value.length ? 'filled' : ''} />
        ))}
      </div>
      <div className="pin-keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'].map((key) => (
          <button
            type="button"
            key={key}
            className="pin-key"
            disabled={disabled}
            aria-label={
              key === 'clear' ? 'Borrar PIN' : key === 'delete' ? 'Borrar última cifra' : key
            }
            onClick={() =>
              key === 'clear'
                ? onChange('')
                : key === 'delete'
                  ? onChange(value.slice(0, -1))
                  : add(key)
            }
          >
            {key === 'clear' ? 'C' : key === 'delete' ? '⌫' : key}
          </button>
        ))}
      </div>
    </div>
  );
}
