import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, MessageSquare, LogOut, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const isAdminUrl = new URLSearchParams(window.location.search).get("admin") === "true";

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[1px] group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all">
              <div className="w-full h-full bg-background rounded-[11px] flex items-center justify-center">
                <span className="font-display font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">N</span>
              </div>
            </div>
            <span className="font-display font-semibold text-xl tracking-tight text-white group-hover:text-blue-400 transition-colors">
              Nutterx
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                {(user?.role === 'admin' || isAdminUrl) && (
                  <Link href="/admin">
                    <Button variant={location === '/admin' ? 'secondary' : 'ghost'} size="sm" className="hidden sm:flex">
                      <ShieldAlert className="w-4 h-4 mr-2 text-red-400" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant={location === '/dashboard' ? 'secondary' : 'ghost'} size="sm" className="hidden sm:flex">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant={location === '/chat' ? 'secondary' : 'ghost'} size="sm">
                    <MessageSquare className="w-4 h-4 mr-2 text-blue-400" />
                    Chat
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground hover:text-red-400">
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="text-muted-foreground hover:text-white">Sign In</Button>
                </Link>
                <Link href="/auth">
                  <Button variant="gradient">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
