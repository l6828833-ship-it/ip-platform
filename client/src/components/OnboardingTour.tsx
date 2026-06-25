import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Sparkles, Package, AppWindow, ShoppingCart, LifeBuoy, Headset, LayoutDashboard, PartyPopper } from "lucide-react";

const STORAGE_KEY = "iptv_onboarding_v2_done";

type Step = {
  selector?: string; // CSS selector of the element to highlight (omit for centered)
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  { icon: Sparkles, title: "Welcome aboard! 👋", body: "Let's take a quick tour of your dashboard. We'll point out each feature — tap Next to continue, or Skip anytime." },
  { selector: '[data-tour="/dashboard"]', icon: LayoutDashboard, title: "Your Dashboard", body: "Your home base — see your activation points, active connections, and recent orders at a glance." },
  { selector: '[data-tour="/plans"]', icon: Package, title: "Plans", body: "Browse subscriptions, choose your connections, and check out with crypto, card, or PayPal." },
  { selector: '[data-tour="/apps"]', icon: AppWindow, title: "Activation Apps & Points", body: "Spend the points you earn from plans to unlock premium player apps — completely free." },
  { selector: '[data-tour="/orders"]', icon: ShoppingCart, title: "My Orders", body: "Track every order and its status here. Once activated, your login details appear on the dashboard." },
  { selector: '[data-tour="/chat"]', icon: LifeBuoy, title: "Support Ticket", body: "Need account help? Open a ticket and our team will get back to you." },
  { selector: '[data-tour="ai-agent"]', icon: Headset, title: "Live Agent", body: "For instant answers, tap the Live Agent button here in the corner anytime." },
  { icon: PartyPopper, title: "You're all set! 🎉", body: "That's the tour. Explore at your own pace — you can always reach us via Support or the Live Agent." },
];

const TIP_W = 340;

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [tipSize, setTipSize] = useState({ w: TIP_W, h: 200 });

  // Show once
  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch { /* ignore */ }
  }, []);

  const current = STEPS[step];

  // Locate + scroll to the current target element
  const locate = useCallback(() => {
    if (!current?.selector) {
      setRect(null);
      return;
    }
    const el = document.querySelector(current.selector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    // read after a short delay so smooth-scroll settles
    window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setRect(r);
      else setRect(null);
    }, 220);
  }, [current]);

  useEffect(() => {
    if (!open) return;
    locate();
    const onChange = () => {
      if (current?.selector) {
        const el = document.querySelector(current.selector) as HTMLElement | null;
        setRect(el ? el.getBoundingClientRect() : null);
      }
    };
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
  }, [open, step, locate, current]);

  // Measure tooltip
  useLayoutEffect(() => {
    if (tipRef.current) {
      setTipSize({ w: tipRef.current.offsetWidth, h: tipRef.current.offsetHeight });
    }
  }, [step, rect]);

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setOpen(false);
  };

  if (!open) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const vh = typeof window !== "undefined" ? window.innerHeight : 768;
  const pad = 16;
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  // Compute tooltip position
  let tipStyle: React.CSSProperties;
  if (!rect) {
    tipStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  } else {
    let left: number;
    let top: number;
    const spaceRight = vw - rect.right;
    if (spaceRight > tipSize.w + pad + 8) {
      // place to the right (good for left sidebar items)
      left = rect.right + pad;
      top = rect.top + rect.height / 2 - tipSize.h / 2;
    } else if (rect.bottom + tipSize.h + pad < vh) {
      // place below
      left = rect.left + rect.width / 2 - tipSize.w / 2;
      top = rect.bottom + pad;
    } else {
      // place above
      left = rect.left + rect.width / 2 - tipSize.w / 2;
      top = rect.top - tipSize.h - pad;
    }
    left = Math.max(pad, Math.min(left, vw - tipSize.w - pad));
    top = Math.max(pad, Math.min(top, vh - tipSize.h - pad));
    tipStyle = { top, left };
  }

  return (
    <>
      <style>{`
        @keyframes tourFade { from { opacity: 0 } to { opacity: 1 } }
        .tour-block { position: fixed; inset: 0; z-index: 9997; }
        .tour-spot { position: fixed; z-index: 9998; border-radius: 14px;
          box-shadow: 0 0 0 9999px rgba(8,15,30,.66), 0 0 0 3px rgba(96,165,250,.9);
          transition: top .4s cubic-bezier(.4,0,.2,1), left .4s cubic-bezier(.4,0,.2,1), width .4s cubic-bezier(.4,0,.2,1), height .4s cubic-bezier(.4,0,.2,1);
          pointer-events: none; }
        .tour-backdrop { position: fixed; inset: 0; z-index: 9998; background: rgba(8,15,30,.66); animation: tourFade .25s ease; }
        .tour-tip { position: fixed; z-index: 9999; width: min(${TIP_W}px, calc(100vw - 32px));
          transition: top .4s cubic-bezier(.4,0,.2,1), left .4s cubic-bezier(.4,0,.2,1);
          animation: tourFade .3s ease; }
      `}</style>

      {/* click blocker so the page behind isn't interactive during the tour */}
      <div className="tour-block" />

      {/* spotlight or centered backdrop */}
      {rect ? (
        <div
          className="tour-spot"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }}
        />
      ) : (
        <div className="tour-backdrop" />
      )}

      {/* tooltip card */}
      <div ref={tipRef} className="tour-tip" style={tipStyle}>
        <div className="rounded-2xl border bg-card text-card-foreground shadow-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg leading-tight">{current.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{current.body}</p>

          {/* progress dots */}
          <div className="flex items-center gap-1.5 mt-4">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"}`} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 mt-4">
            <Button variant="ghost" size="sm" onClick={finish}>Skip</Button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-1">{step + 1}/{STEPS.length}</span>
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>Back</Button>
              )}
              {isLast ? (
                <Button size="sm" onClick={finish}>Done</Button>
              ) : (
                <Button size="sm" onClick={() => setStep((s) => s + 1)}>Next</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
