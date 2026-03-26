import { useLocation } from "wouter";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { useGetChats, getGetChatsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, LogOut, Sun, Moon, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [location] = useLocation();

  const isAdminPage = location === "/admin";
  const isAdminUser = user?.role === "admin";

  const { data: chats } = useGetChats({ query: { queryKey: getGetChatsQueryKey(), enabled: isAuthenticated } });
  const totalUnread = chats
    ? chats.reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0)
    : 0;
  const showBadge = totalUnread > 0 && location !== "/chat";

  const dashboardHref = (isAdminPage || isAdminUser) ? "/admin" : "/dashboard";
  const logoHref = (isAdminPage || isAdminUser) ? "/admin" : isAuthenticated ? "/dashboard" : "/";

  const NAV_LINKS = [
    { href: "/clients",   label: "Clients",   icon: Users },
    {
      href:  dashboardHref,
      label: "Dashboard",
      icon:  LayoutDashboard,
      onClick: (isAdminPage || isAdminUser)
        ? () => window.dispatchEvent(new CustomEvent("admin:reset"))
        : undefined,
    },
    { href: "/chat", label: "Chat", icon: MessageSquare, badge: showBadge ? totalUnread : 0 },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href={logoHref} className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 shrink-0 group-hover:scale-105 transition-transform">
              <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow">
                <defs>
                  <linearGradient id="nb" x1="128" y1="0" x2="128" y2="256" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#fefcf0"/>
                    <stop offset="50%"  stopColor="#fffef5"/>
                    <stop offset="100%" stopColor="#f9f0d0"/>
                  </linearGradient>
                  <linearGradient id="nr" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#f5d878"/>
                    <stop offset="40%"  stopColor="#c89000"/>
                    <stop offset="100%" stopColor="#e8b420"/>
                  </linearGradient>
                  <linearGradient id="nn" x1="128" y1="72" x2="128" y2="184" gradientUnits="userSpaceOnUse">
                    <stop offset="0%"   stopColor="#e8b420"/>
                    <stop offset="50%"  stopColor="#c89000"/>
                    <stop offset="100%" stopColor="#7a5200"/>
                  </linearGradient>
                </defs>
                <circle cx="128" cy="128" r="121" fill="url(#nb)"/>
                <circle cx="128" cy="128" r="121" fill="none" stroke="url(#nr)" strokeWidth="6"/>
                <circle cx="128" cy="128" r="112" fill="none" stroke="url(#nr)" strokeWidth="1.2" opacity="0.55"/>
                <rect x="88" y="72" width="18" height="112" rx="4" fill="url(#nn)"/>
                <rect x="150" y="72" width="18" height="112" rx="4" fill="url(#nn)"/>
                <polygon points="88,72 106,72 168,184 150,184" fill="url(#nn)"/>
              </svg>
            </div>
            <span className="font-display font-bold text-base tracking-tight">
              Nutterx <span className="text-muted-foreground font-normal hidden sm:inline">Technologies</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-1">

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggle}
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center border transition-all",
                theme === "dark"
                  ? "bg-white/5 border-white/10 text-amber-300 hover:bg-white/10"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
              )}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {isAuthenticated && (
              <>
                {/* Inline nav links — icon + label on sm+, icon only on xs */}
                {NAV_LINKS.map(link => {
                  const active = location === link.href;
                  const badge  = (link as any).badge as number;
                  return (
                    <Link key={link.href} href={link.href}>
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={(link as any).onClick}
                        className={cn(
                          "relative flex items-center gap-1.5 px-2.5 h-9 rounded-xl text-sm font-semibold transition-all",
                          active
                            ? "text-white"
                            : "text-foreground/70 hover:text-foreground hover:bg-secondary/60"
                        )}
                        style={active ? { background: "linear-gradient(90deg,#075E54,#25D366)" } : {}}
                        aria-label={link.label}
                      >
                        <link.icon className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">{link.label}</span>
                        {badge > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-0.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                            {badge > 9 ? "9+" : badge}
                          </span>
                        )}
                      </motion.button>
                    </Link>
                  );
                })}

                {/* Logout */}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 px-2.5 h-9 rounded-xl text-sm font-semibold text-foreground/60 hover:text-red-400 hover:bg-red-400/8 border border-transparent hover:border-red-400/20 transition-all"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="hidden md:inline">Logout</span>
                </motion.button>
              </>
            )}

            {!isAuthenticated && (
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
  );
}
