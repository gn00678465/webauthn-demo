import { createTheme } from "@mui/material/styles";

/**
 * 「Cryptographic Vault」設計系統 —
 * 深墨藍精密儀器感，薄荷綠（安全金鑰 LED）為主色，
 * credential 資料一律等寬字體。
 */
export const fonts = {
  display: '"Bricolage Grotesque", "Schibsted Grotesk", sans-serif',
  body: '"Schibsted Grotesk", "Helvetica Neue", sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace'
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#4DE6B4", contrastText: "#06281C" },
    secondary: { main: "#7FB4FF" },
    error: { main: "#FF6B81" },
    background: { default: "#070D17", paper: "#0D1524" },
    text: { primary: "#E6EEF8", secondary: "#8FA3BD" },
    divider: "rgba(127, 180, 255, 0.16)"
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: fonts.body,
    h3: { fontFamily: fonts.display, fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontFamily: fonts.display, fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontFamily: fonts.display, fontWeight: 600 },
    subtitle1: { fontFamily: fonts.body },
    button: { textTransform: "none", fontWeight: 600 }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(127, 180, 255, 0.14)",
          boxShadow: "0 1.5rem 3rem rgba(2, 6, 14, 0.55)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          paddingTop: 10,
          paddingBottom: 10,
          transition: "transform 150ms ease, box-shadow 150ms ease"
        },
        containedPrimary: {
          boxShadow: "0 0 0 rgba(77, 230, 180, 0)",
          "&:hover": {
            boxShadow: "0 0.25rem 1.25rem rgba(77, 230, 180, 0.35)",
            transform: "translateY(-1px)"
          }
        },
        outlined: {
          borderColor: "rgba(127, 180, 255, 0.3)",
          "&:hover": { borderColor: "#7FB4FF", backgroundColor: "rgba(127, 180, 255, 0.08)" }
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(7, 13, 23, 0.6)",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(127, 180, 255, 0.22)"
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(127, 180, 255, 0.45)"
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: fonts.mono, fontWeight: 500 }
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(127, 180, 255, 0.14)",
          borderRadius: 12,
          backgroundColor: "rgba(127, 180, 255, 0.04)",
          transition: "border-color 150ms ease, background-color 150ms ease",
          "&:hover": {
            borderColor: "rgba(77, 230, 180, 0.45)",
            backgroundColor: "rgba(77, 230, 180, 0.05)"
          }
        }
      }
    }
  }
});

export default theme;
