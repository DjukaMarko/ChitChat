import { createContext } from "react";

// Define your theme object
export const theme = {
  black: "#000",
  white : "#fff",
  lightBlack: "#333333",
  lightMode: {
    primaryC: "#991b1b",
    primaryCHover: "#b91c1c",
    secondaryC: "#f2f2f2",
    secondaryCHover: "#e5e5e5",
    secondOrderText: "#6b7280",
    inputInnerElements: "#9e9e9e",
    landingWaves: "#f8f8f8"
  },
  darkMode: {
    primaryC: "#991b1b",
    primaryCHover: "#b91c1c",
    secondaryC: "#0d0d0d",
    secondaryCHover: "#1a1a1a",
    secondOrderText: "#434343",
    inputInnerElements: "#616161",
    landingWaves: "#2e2e2e"
  }
  // Add other theme properties as needed
};

// Create a context for your theme
export const ThemeProvider = createContext(theme);