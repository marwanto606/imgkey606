import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { useGoogleAnalytics } from "@/hooks/use-google-analytics";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ImageTitleKeyword from "./pages/ImageTitleKeyword";
import ImagePrompt from "./pages/ImagePrompt";
import ImageInspire from "./pages/ImageInspire";

const queryClient = new QueryClient();

const AppWithAnalytics = () => {
  useGoogleAnalytics();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/image-title-keyword" element={<ImageTitleKeyword />} />
      <Route path="/image-prompt" element={<ImagePrompt />} />
      <Route path="/image-inspire" element={<ImageInspire />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="imgkey606-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppWithAnalytics />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
