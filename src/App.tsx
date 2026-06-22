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
import Profile from "./pages/Profile";
import DailyChallenge from "./pages/DailyChallenge";
import Games from "./pages/Games";
import Friends from "./pages/Friends";
import Chat from "./pages/Chat";
import Tournaments from "./pages/Tournaments";
import CustomWordLists from "./pages/CustomWordLists";
import Reminders from "./pages/Reminders";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";
import Goals from "./pages/Goals";
import FocusMode from "./pages/FocusMode";
import Learn from "./pages/Learn";
import LearnSession from "./pages/LearnSession";
import LearnAnalytics from "./pages/LearnAnalytics";
import LearnCoach from "./pages/LearnCoach";
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
                <Route path="/profile" element={<Profile />} />
                <Route path="/challenge" element={<DailyChallenge />} />
                <Route path="/games" element={<Games />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/tournaments" element={<Tournaments />} />
                <Route path="/word-lists" element={<CustomWordLists />} />
                <Route path="/reminders" element={<Reminders />} />
                <Route path="/certificates" element={<Certificates />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/focus" element={<FocusMode />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/learn/session" element={<LearnSession />} />
                <Route path="/learn/analytics" element={<LearnAnalytics />} />
                <Route path="/learn/coach" element={<LearnCoach />} />
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
