declare module "next-themes" {
  export interface UseTheme {
    theme?: string;
    setTheme: (theme: string) => void;
    [key: string]: unknown;
  }

  export function useTheme(): UseTheme;
}
