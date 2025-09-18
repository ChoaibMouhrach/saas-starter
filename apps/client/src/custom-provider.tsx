import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/custom/theme-provider";

interface CustomProviderProps {
  children: React.ReactNode;
}

export const CustomProvider: React.FC<CustomProviderProps> = ({ children }) => {
  const [client] = useState(() => new QueryClient());
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <QueryClientProvider client={client}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
};
