declare module "next-themes" {
  import * as React from "react";

  export interface UseTheme {
    theme?: string;
    setTheme: (theme: string) => void;
    [key: string]: unknown;
  }

  export interface ThemeProviderProps {
    attribute?: string;
    defaultTheme?: string;
    value?: Record<string, string>;
    children?: React.ReactNode;
    forcedTheme?: string;
    enableSystem?: boolean;
    enableColorScheme?: boolean;
    storageKey?: string;
    themes?: string[];
    disableTransitionOnChange?: boolean;
  }

  export const ThemeProvider: React.FC<ThemeProviderProps>;

  export function useTheme(): UseTheme;
}

declare module "next-themes/dist/types" {
  import type { ThemeProviderProps } from "next-themes";
  export type { ThemeProviderProps };
}
