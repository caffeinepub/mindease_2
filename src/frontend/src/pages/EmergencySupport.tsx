import { Phone, MessageSquare, Globe, Heart, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const resources = [
  {
    name: "National Suicide Prevention Lifeline",
    contact: "Call 988",
    href: "tel:988",
    description:
      "Free, confidential support for people in distress, 24 hours a day, 7 days a week.",
    icon: Phone,
    badge: "Call Now",
    colors: "border-rose-300 dark:border-rose-700/50 hover:border-rose-400 dark:hover:border-rose-600",
    badgeColors: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400",
    iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    href: "sms:741741?body=HOME",
    description:
      "Text-based support for people in crisis. Trained crisis counselors available 24/7.",
    icon: MessageSquare,
    badge: "Text Support",
    colors: "border-orange-300 dark:border-orange-700/50 hover:border-orange-400 dark:hover:border-orange-600",
    badgeColors: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    iconBg: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  },
  {
    name: "SAMHSA Helpline",
    contact: "1-800-662-4357",
    href: "tel:18006624357",
    description:
      "Substance Abuse and Mental Health Services Administration. Free, confidential, 24/7 treatment referrals.",
    icon: Phone,
    badge: "Free & Confidential",
    colors: "border-amber-300 dark:border-amber-700/50 hover:border-amber-400 dark:hover:border-amber-600",
    badgeColors: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    name: "International Crisis Centres",
    contact: "Find your local center",
    href: "https://www.iasp.info/resources/Crisis_Centres/",
    description:
      "International Association for Suicide Prevention directory of crisis centres worldwide.",
    icon: Globe,
    badge: "International",
    colors: "border-teal-300 dark:border-teal-700/50 hover:border-teal-400 dark:hover:border-teal-600",
    badgeColors: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
    iconBg: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  },
];

export default function EmergencySupport() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-7">
      {/* Hero */}
      <div className="animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500/80 to-orange-400/70 px-7 py-8 text-white shadow-card-hover">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-10 w-28 h-28 rounded-full bg-white blur-2xl" />
            <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-white blur-xl" />
          </div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-white/20 shrink-0">
              <Heart size={22} className="fill-current" />
            </div>
            <div>
              <h2 className="font-display text-3xl md:text-4xl mb-2">
                You Are Not Alone
              </h2>
              <p className="text-white/85 font-body text-sm max-w-md leading-relaxed">
                Reaching out takes courage. Real support is available right now,
                whenever you need it.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Notice */}
      <div className="animate-slide-up stagger-1 flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400">
        <ShieldAlert size={17} className="mt-0.5 shrink-0" />
        <p className="text-sm font-body leading-relaxed">
          <strong className="font-semibold">Immediate danger?</strong> Call
          emergency services — <strong>911</strong> in the US, or your local
          equivalent. These resources are real and free to use.
        </p>
      </div>

      {/* Resources */}
      <section>
        <h3 className="font-display text-xl text-foreground mb-4 animate-slide-up stagger-1">
          Crisis Resources
        </h3>
        <div className="space-y-3">
          {resources.map((resource, i) => (
            <a
              key={resource.name}
              href={resource.href}
              target={resource.href.startsWith("http") ? "_blank" : undefined}
              rel={
                resource.href.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
              className={`block animate-slide-up stagger-${i + 2}`}
            >
              <Card
                className={`border-2 transition-all duration-300 shadow-card hover:shadow-card-hover cursor-pointer group ${resource.colors}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-110 ${resource.iconBg}`}
                    >
                      <resource.icon size={18} className="text-current" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h4 className="font-body font-semibold text-sm text-foreground">
                          {resource.name}
                        </h4>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 font-body ${resource.badgeColors}`}
                        >
                          {resource.badge}
                        </span>
                      </div>
                      <p className="font-display text-base mt-1 text-foreground group-hover:underline underline-offset-2">
                        {resource.contact}
                      </p>
                      <p className="text-xs text-muted-foreground font-body mt-1.5 leading-relaxed">
                        {resource.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div className="animate-slide-up stagger-5 p-5 rounded-xl bg-muted/40 border border-border/50 text-center">
        <p className="text-xs text-muted-foreground font-body leading-relaxed max-w-sm mx-auto">
          MindEase is a support tool, not a medical service. These helplines are
          operated by independent organizations. In an emergency, always contact
          local emergency services first.
        </p>
      </div>
    </div>
  );
}
