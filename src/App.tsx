import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SoundProvider } from "@/contexts/SoundContext";
import Index from "./pages/Index";
import Test from "./pages/Test";
import Auth from "./pages/Auth";
import Lessons from "./pages/Lessons";
import Stats from "./pages/Stats";
import Achievements from "./pages/Achievements";
import Leaderboard from "./pages/Leaderboard";
import Race from "./pages/Race";
import Practice from "./pages/Practice";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SoundProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/test" element={<Test />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/stats" element={<Stats />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/race" element={<Race />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </SoundProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
