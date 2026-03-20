import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, LogOut, Sun, Moon, Users, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
                <span className="font-display font-bold text-sm text-white">N</span>
              </div>
              <span className="font-display font-bold text-base tracking-tight">
                Nutterx <span className="text-muted-foreground font-normal hidden sm:inline">Technologies</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {isAuthenticated && NAV_LINKS.map(link => (
                <Link key={link.href} href={link.href}>
                  <button className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                    location === link.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  )}>
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </button>
                </Link>
              ))}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggle}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
                  theme === "dark"
                    ? "bg-white/5 border-white/10 text-amber-300 hover:bg-white/10"
                    : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
                )}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </motion.button>

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => logout()}
                    className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/5 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                  {/* Mobile hamburger */}
                  <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center border border-border hover:bg-secondary/60 transition-all"
                  >
                    {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth">
                    <button className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground px-3 py-2 rounded-xl hover:bg-secondary/60 transition-all">
                      Sign In
                    </button>
                  </Link>
                  <Link href="/auth">
                    <Button variant="gradient" size="sm" className="text-sm font-semibold px-4">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile slide-down drawer */}
      <AnimatePresence>
        {mobileOpen && isAuthenticated && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 right-0 z-40 md:hidden border-b border-border bg-background/95 backdrop-blur-xl shadow-2xl"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                    <button className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left",
                      location === link.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                    )}>
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </button>
                  </Link>
                ))}
                <div className="pt-2 pb-1 border-t border-border mt-2">
                  <div className="px-4 py-2 text-xs text-muted-foreground">
                    Signed in as <span className="font-semibold text-foreground">{user?.name}</span>
                  </div>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/5 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
