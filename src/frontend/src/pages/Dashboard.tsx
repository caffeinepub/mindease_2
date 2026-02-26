import { Link } from "@tanstack/react-router";
import {
  TrendingUp,
  BookOpen,
  MessageCircle,
  SmilePlus,
  Flame,
  AlertTriangle,
  BarChart2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStats, useLast30DaysMoods } from "../hooks/useBackend";
import { type MoodLog, Mood } from "../backend.d";

const moodToValue: Record<Mood, number> = {
  [Mood.awful]: 1,
  [Mood.bad]: 2,
  [Mood.okay]: 3,
  [Mood.good]: 4,
  [Mood.great]: 5,
};

const moodToLabel: Record<number, string> = {
  1: "Awful",
  2: "Bad",
  3: "Okay",
  4: "Good",
  5: "Great",
};

function formatChartDate(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  const d = new Date(ms);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function prepareMoodData(logs: MoodLog[]) {
  return [...logs]
    .sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1))
    .map((log) => ({
      date: formatChartDate(log.timestamp),
      value: moodToValue[log.mood],
      mood: log.mood,
    }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length > 0) {
    const val = payload[0].value;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2 shadow-card text-sm">
        <p className="text-muted-foreground font-body">{label}</p>
        <p className="font-semibold text-foreground">{moodToLabel[val]}</p>
      </div>
    );
  }
  return null;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  delay: string;
}) {
  return (
    <Card className={`animate-slide-up card-glass border-border/60 shadow-card ${delay}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-body mb-1.5">
              {label}
            </p>
            <p className="text-3xl font-display text-foreground">{value}</p>
          </div>
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon size={18} className="text-current" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: moodLogs, isLoading: moodsLoading } = useLast30DaysMoods();

  const chartData = moodLogs ? prepareMoodData(moodLogs) : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-7">
      {/* Header Hero */}
      <div className="animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 px-7 py-8 text-primary-foreground shadow-card-hover">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-8 w-32 h-32 rounded-full bg-white blur-2xl" />
            <div className="absolute bottom-0 right-24 w-20 h-20 rounded-full bg-white blur-xl" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-body text-primary-foreground/70 mb-1 tracking-wide uppercase">
              Welcome back
            </p>
            <h2 className="font-display text-3xl md:text-4xl mb-2">
              How are you feeling today?
            </h2>
            <p className="text-primary-foreground/80 font-body text-sm max-w-md">
              Your mental wellness companion is here to support you every step
              of the way.
            </p>
          </div>
        </div>
      </div>

      {/* Risk Alert */}
      {stats?.riskAlert && (
        <div className="animate-slide-up flex items-start gap-3 p-4 rounded-xl border bg-[oklch(var(--wellness-alert-bg))] border-[oklch(var(--wellness-alert-border))] text-[oklch(var(--wellness-alert-text))]">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-sm font-body">
              We noticed you&apos;ve been feeling down lately
            </p>
            <p className="text-sm mt-0.5 font-body opacity-80">
              Consider reaching out to a professional — you deserve support.{" "}
              <Link to="/emergency" className="underline underline-offset-2 font-medium">
                View resources →
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <section>
        <h3 className="font-display text-xl text-foreground mb-4">Your Progress</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsLoading ? (
            <>
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </>
          ) : (
            <>
              <StatCard
                icon={Flame}
                label="Current Streak"
                value={`${stats?.currentStreak ?? 0}d`}
                color="bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400"
                delay="stagger-1"
              />
              <StatCard
                icon={TrendingUp}
                label="Mood Logs"
                value={Number(stats?.totalMoodLogs ?? 0)}
                color="bg-primary/10 text-primary"
                delay="stagger-2"
              />
              <StatCard
                icon={BookOpen}
                label="Journal Entries"
                value={Number(stats?.totalJournalEntries ?? 0)}
                color="bg-secondary text-secondary-foreground"
                delay="stagger-3"
              />
            </>
          )}
        </div>
      </section>

      {/* Mood Chart */}
      <section>
        <Card className="animate-slide-up stagger-3 card-glass border-border/60 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart2 size={17} className="text-primary" />
              <CardTitle className="font-display text-lg font-normal">
                Mood Trend — Last 30 Days
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            {moodsLoading ? (
              <Skeleton className="h-52 w-full rounded-xl" />
            ) : chartData.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center text-muted-foreground">
                <TrendingUp size={36} className="mb-3 opacity-30" />
                <p className="text-sm font-body">
                  No mood data yet — start logging your mood!
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))", fontFamily: "DM Sans" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={[1, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tickFormatter={(v: number) => moodToLabel[v] ?? ""}
                    tick={{ fontSize: 10, fill: "oklch(var(--muted-foreground))", fontFamily: "DM Sans" }}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ fill: "oklch(var(--primary))", r: 3.5, strokeWidth: 0 }}
                    activeDot={{ r: 5.5, fill: "oklch(var(--primary))", strokeWidth: 2, stroke: "oklch(var(--card))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Quick Actions */}
      <section className="animate-slide-up stagger-4">
        <h3 className="font-display text-xl text-foreground mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/mood">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2.5 border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 rounded-xl shadow-xs group"
            >
              <SmilePlus size={22} className="text-primary group-hover:text-primary-foreground transition-colors" />
              <span className="font-body font-medium text-sm">Log Today&apos;s Mood</span>
            </Button>
          </Link>
          <Link to="/journal">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2.5 border-secondary-foreground/20 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary-foreground/30 transition-all duration-200 rounded-xl shadow-xs group"
            >
              <BookOpen size={22} className="text-secondary-foreground/70 group-hover:text-secondary-foreground transition-colors" />
              <span className="font-body font-medium text-sm">Write in Journal</span>
            </Button>
          </Link>
          <Link to="/chat">
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2.5 border-accent-foreground/20 hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/30 transition-all duration-200 rounded-xl shadow-xs group"
            >
              <MessageCircle size={22} className="text-accent-foreground/70 group-hover:text-accent-foreground transition-colors" />
              <span className="font-body font-medium text-sm">Talk to AI</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
