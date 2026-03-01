import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, Radio } from "lucide-react";

const navItems = [
  { path: "/", label: "Home" },
  { path: "/log-vibe", label: "Log Vibe" },
  { path: "/my-aura", label: "My Aura" },
  { path: "/resonance-map", label: "Resonance Map", live: true },
  { path: "/matches", label: "Matches" },
  { path: "/profile", label: "Profile" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/20 backdrop-blur-3xl border-b-2 border-indigo-500/20">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-cyan-500/5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="relative"
            >
              <Sparkles className="w-7 h-7 text-indigo-400" />
              <div className="absolute inset-0 blur-xl bg-indigo-400/50 group-hover:bg-indigo-400/80 transition-all" />
            </motion.div>
            <span className="font-display text-2xl font-bold gradient-text tracking-tight">
              ResoSphere
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    location.pathname === item.path
                      ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                  {item.live && (
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-1 text-xs text-red-400"
                    >
                      <Radio className="w-3 h-3" />
                      LIVE
                    </motion.span>
                  )}
                </motion.div>
                {location.pathname === item.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
                    style={{ boxShadow: "0 0 10px rgba(99, 102, 241, 0.8)" }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Mobile toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 text-foreground rounded-xl glass-card-hover"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/30 backdrop-blur-3xl border-t border-border/30"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === item.path
                        ? "text-white bg-gradient-to-r from-indigo-600 to-purple-600"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    {item.label}
                    {item.live && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <Radio className="w-3 h-3" />
                        LIVE
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
