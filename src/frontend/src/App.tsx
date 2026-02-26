import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import MoodTracker from "./pages/MoodTracker";
import Journal from "./pages/Journal";
import Chat from "./pages/Chat";
import EmergencySupport from "./pages/EmergencySupport";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ---- Login / Landing Page ----
function LandingPage() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center mesh-bg relative overflow-hidden px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 -left-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: "oklch(0.72 0.085 148)" }}
        />
        <div
          className="absolute bottom-1/4 -right-16 w-56 h-56 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.68 0.09 215)" }}
        />
        <div
          className="absolute top-2/3 left-1/3 w-40 h-40 rounded-full opacity-10 blur-2xl"
          style={{ background: "oklch(0.88 0.065 168)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        {/* Logo mark */}
        <div className="animate-fade-in mb-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl bg-primary shadow-card-hover mb-5 mx-auto animate-breathe">
            <Heart className="w-10 h-10 text-primary-foreground fill-current" />
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-foreground mb-3">
            MindEase
          </h1>
          <p className="text-muted-foreground font-body text-base leading-relaxed max-w-xs mx-auto">
            Your mental wellness companion — track moods, journal thoughts, and
            find AI-powered support.
          </p>
        </div>

        {/* Feature pills */}
        <div className="animate-slide-up stagger-1 flex flex-wrap justify-center gap-2 mb-10">
          {[
            "🧘 Mood tracking",
            "📓 Daily journaling",
            "💬 AI chat support",
            "🆘 Crisis resources",
          ].map((feature) => (
            <span
              key={feature}
              className="text-xs font-body px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground border border-border/40"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Sign in card */}
        <div className="animate-slide-up stagger-2 w-full max-w-sm">
          <div className="card-glass rounded-2xl p-7 shadow-card border border-border/60">
            <h2 className="font-display text-xl text-foreground mb-1.5">
              Get started
            </h2>
            <p className="text-sm text-muted-foreground font-body mb-6 leading-relaxed">
              Sign in securely with Internet Identity to access your private
              wellness space.
            </p>

            <Button
              onClick={login}
              disabled={isLoggingIn || isInitializing}
              className="w-full rounded-xl py-5 font-body font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200"
            >
              {isLoggingIn || isInitializing ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  {isInitializing ? "Initializing…" : "Connecting…"}
                </>
              ) : (
                <>
                  <Heart size={16} className="mr-2 fill-current" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <p className="text-[11px] text-muted-foreground/70 font-body mt-4 text-center leading-relaxed">
              Your data is private and stored securely on the Internet Computer.
              No personal information is shared.
            </p>
          </div>
        </div>

        <p className="animate-fade-in stagger-3 text-xs text-muted-foreground/50 font-body mt-8">
          © 2026 MindEase · Built with{" "}
          <Heart size={10} className="inline fill-current text-rose-400 mx-0.5" />{" "}
          using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

// ---- Auth Guard ----
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background mesh-bg">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-breathe">
            <Heart size={22} className="text-primary" />
          </div>
          <div className="flex items-center gap-2 text-sm font-body">
            <Loader2 size={14} className="animate-spin" />
            Loading MindEase…
          </div>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LandingPage />;
  }

  return <>{children}</>;
}

// ---- Root Layout ----
function RootLayout() {
  return (
    <AuthGuard>
      <Layout>
        <Outlet />
      </Layout>
    </AuthGuard>
  );
}

// ---- Routes ----
const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const moodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/mood",
  component: MoodTracker,
});

const journalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/journal",
  component: Journal,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: Chat,
});

const emergencyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/emergency",
  component: EmergencySupport,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  moodRoute,
  journalRoute,
  chatRoute,
  emergencyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
