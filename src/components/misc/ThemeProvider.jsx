import { createContext } from "react";

// Define your theme object
export const theme = {
    colors: {
      primary: 'blue',
      secondary: 'green',
    },
    // Add other theme properties as needed
  };

  // Create a context for your theme
  export const ThemeProvider = createContext(theme);