import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, Globe, Heart, User } from "lucide-react";
import { motion } from "framer-motion";

const MobileNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/log-vibe", icon: Sparkles, label: "Log" },
    { path: "/resonance-map", icon: Globe, label: "Map" },
    { path: "/matches", icon: Heart, label: "Matches" },
    { path: "/my-aura", icon: User, label: "Aura" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute inset-0 bg-purple-500/20 rounded-xl"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
              <Icon
                className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? "text-purple-400" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-xs relative z-10 transition-colors ${
                  isActive ? "text-purple-400 font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
