import { type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  SmilePlus,
  BookOpen,
  MessageCircle,
  Phone,
  Heart,
  LogOut,
} from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/mood", label: "Mood Tracker", icon: SmilePlus },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/chat", label: "Chat", icon: MessageCircle },
  { to: "/emergency", label: "Emergency", icon: Phone },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { clear, identity } = useInternetIdentity();

  const isActive = (item: (typeof navItems)[0]) => {
    if (item.exact) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  return (
    <div className="min-h-screen flex bg-background mesh-bg">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50">
        <div className="flex flex-col h-full bg-sidebar/90 backdrop-blur-xl border-r border-sidebar-border shadow-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-7 border-b border-sidebar-border">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary shadow-sm">
              <Heart className="w-5 h-5 text-primary-foreground fill-current" />
            </div>
            <div>
              <h1 className="font-display text-lg leading-tight text-sidebar-foreground">
                MindEase
              </h1>
              <p className="text-xs text-sidebar-accent-foreground/70 font-body">
                Wellness companion
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                    active
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-4.5 h-4.5 shrink-0 transition-transform duration-200",
                      active ? "scale-110" : "group-hover:scale-105"
                    )}
                    size={18}
                  />
                  <span>{item.label}</span>
                  {item.to === "/emergency" && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="px-3 py-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-sidebar-accent/60 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {identity?.getPrincipal().toString().slice(0, 2).toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-sidebar-foreground/60 truncate font-body">
                  {identity?.getPrincipal().toString().slice(0, 16) ?? "Anonymous"}...
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all duration-200 font-body"
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3.5 bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary shadow-sm">
              <Heart className="w-4 h-4 text-primary-foreground fill-current" />
            </div>
            <span className="font-display text-base text-foreground">MindEase</span>
          </div>
          <button
            type="button"
            onClick={clear}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card/90 backdrop-blur-xl border-t border-border">
          <div className="flex items-stretch">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-all duration-200 relative",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute top-0 inset-x-4 h-0.5 bg-primary rounded-b-full" />
                  )}
                  <item.icon
                    size={item.to === "/emergency" ? 19 : 18}
                    className={cn(
                      "transition-transform duration-200",
                      active ? "scale-110" : "",
                      item.to === "/emergency" && "text-destructive"
                    )}
                  />
                  <span className={cn(item.to === "/emergency" && !active && "text-destructive/70")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
