import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import PageTransition from "@/components/PageTransition";
import Starfield from "@/components/Starfield";
import Index from "./pages/Index";
import LogVibe from "./pages/LogVibe";
import MyAura from "./pages/MyAura";
import ResonanceMap from "./pages/ResonanceMap";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/log-vibe" element={<PageTransition><LogVibe /></PageTransition>} />
        <Route path="/my-aura" element={<PageTransition><MyAura /></PageTransition>} />
        <Route path="/resonance-map" element={<PageTransition><ResonanceMap /></PageTransition>} />
        <Route path="/matches" element={<PageTransition><Matches /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner position="top-center" theme="dark" />
        <Toaster />
        <BrowserRouter>
          <div className="dark pb-20 md:pb-0 relative min-h-screen">
            <Starfield />
            <Navbar />
            <AnimatedRoutes />
            <MobileNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
