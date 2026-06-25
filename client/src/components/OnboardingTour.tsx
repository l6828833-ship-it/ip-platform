import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Sparkles, Package, AppWindow, ShoppingCart, Headset } from "lucide-react";

const STORAGE_KEY = "iptv_onboarding_v1_done";

const STEPS = [
  {
    icon: Sparkles,
    title: "Welcome to your dashboard 👋",
    body: "Here's a quick 30-second tour of what you can do here. You can skip it anytime.",
  },
  {
    icon: Package,
    title: "Browse Plans",
    body: "Open the Plans page to choose a subscription and the number of connections you need, then check out with crypto, card, or PayPal.",
  },
  {
    icon: AppWindow,
    title: "Activation Apps & Points",
    body: "Plans reward you with activation points. Spend them on the Activation Apps page to unlock premium player apps — completely free.",
  },
  {
    icon: ShoppingCart,
    title: "Orders & Credentials",
    body: "Track every order in My Orders. Once an order is activated, your login details appear right here on your dashboard.",
  },
  {
    icon: Headset,
    title: "Need a hand?",
    body: "Open a Support Ticket anytime, or tap the Live Agent bubble in the corner for instant answers.",
  },
];

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      /* localStorage unavailable — skip the tour silently */
    }
  }, []);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) finish(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-xl">{current.title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {current.body}
          </DialogDescription>
        </DialogHeader>

        {/* progress dots */}
        <div className="flex justify-center gap-2 py-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={finish}>
            Skip
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={finish}>
                Get Started
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
