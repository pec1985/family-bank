'use client';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import type { ReactNode } from 'react';

const theme = createTheme({
  palette: {
    primary: { main: '#2644a5' },
    secondary: { main: '#d2ef7d', contrastText: '#202822' },
    text: { primary: '#202822', secondary: '#59665f' },
    background: { default: '#f1f2fa', paper: '#fffef9' },
    divider: '#2028221a',
  },
  typography: {
    fontFamily: 'var(--font-body)',
    h1: { fontFamily: 'var(--font-title)', fontWeight: 700 },
    h2: { fontFamily: 'var(--font-title)', fontWeight: 700 },
    h3: { fontFamily: 'var(--font-title)', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 800 },
    h4: { fontFamily: 'var(--font-title)', fontWeight: 700, letterSpacing: '-1px' },
    h5: { fontFamily: 'var(--font-title)', fontWeight: 700, letterSpacing: '-0.7px' },
    h6: { fontFamily: 'var(--font-title)', fontWeight: 700, letterSpacing: '-0.5px' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, borderRadius: 16, paddingInline: 18 },
        containedPrimary: { backgroundColor: '#202822', '&:hover': { backgroundColor: '#2644a5' } },
      },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: '#fffef9', borderRadius: 14 } },
    },
    MuiDialog: {
      defaultProps: { maxWidth: 'sm' },
      styleOverrides: { paper: { backgroundImage: 'none', borderRadius: 28 } },
    },
    MuiCard: { styleOverrides: { root: { backgroundImage: 'none', boxShadow: 'none' } } },
    MuiTooltip: { defaultProps: { arrow: true } },
  },
});

export default function AppTheme({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
