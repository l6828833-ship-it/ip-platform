import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Check, Users, Coins, ChevronDown, ChevronUp } from "lucide-react";
import PublicAIChatWidget from "@/components/PublicAIChatWidget";

const LOGO_URL = "https://pub-5b34ab7e74be4b678343a2ff1c41d64c.r2.dev/iptvtop%20live%20logo.png";

/* World Cup 2026 ad landing page (public). Reuses the homepage info with a
   World Cup–focused hero, a modern dark theme, a live countdown and lots of
   CTAs. Served at "/world-cup" for paid traffic. */

// FIFA World Cup 2026 final — used for the live countdown / urgency.
const FINAL_DATE = new Date("2026-07-19T18:00:00Z").getTime();

const FEATURES = [
  { ic: "⚽", t: "Every World Cup Match Live", d: "All 104 games in 4K & HD — group stage to the final, plus pre-game and highlights, with zero blackouts." },
  { ic: "📡", t: "50,000+ Live Channels", d: "Sports, news, movies, kids and worldwide TV in one place — including every channel showing the World Cup." },
  { ic: "🏆", t: "All Sports & PPV Included", d: "Beyond the World Cup: football leagues, UFC, boxing, NBA, F1 and major PPV events at no extra cost." },
  { ic: "⚡", t: "Anti-Freeze on Match Nights", d: "Load-balanced servers with 99.9% uptime keep your stream steady even when millions are watching." },
  { ic: "📱", t: "Watch on Any Device", d: "Smart TV, Firestick, Android, iPhone, MAG, Enigma2 and PC — use the apps you already own." },
  { ic: "🍿", t: "200,000+ Movies & Series", d: "A massive on-demand library for the hours between kick-offs, synced across every screen." },
];

const BENEFITS = [
  { t: "Never miss a goal", d: "Every group game, knockout and the final in crisp 4K — no regional blackouts, no cable contract." },
  { t: "Spend far less", d: "One subscription replaces cable and several sports apps you'd otherwise pay for during the tournament." },
  { t: "Watch anywhere", d: "Following the matches while traveling? Stream from any country on a stable internet connection." },
  { t: "Set up in minutes", d: "Start a free 24-hour trial today and be ready well before the next kick-off." },
];

const DEVICES = [
  { e: "📺", n: "Smart TV" }, { e: "🤖", n: "Android" }, { e: "📱", n: "iPhone & iPad" }, { e: "🔥", n: "Firestick" },
  { e: "📦", n: "MAG Box" }, { e: "💻", n: "PC / Laptop" }, { e: "🍎", n: "Apple TV" }, { e: "🟣", n: "Roku" },
];

const CATEGORIES = ["⚽ World Cup", "🏆 PPV Events", "🥊 UFC & Boxing", "🏀 NBA", "🏎 Formula 1", "🎬 Movies", "📰 News", "🧒 Kids", "🌍 International", "🇫🇷 French", "🕌 Arabic", "📺 4K Premium"];

const TESTIMONIALS = [
  { n: "James W.", c: "🇺🇸 United States", t: "Watched every match in 4K without a single freeze. Cancelled cable the same week." },
  { n: "Sophie L.", c: "🇫🇷 France", t: "Set it up on my Firestick in five minutes and caught the opening game live. Incredible value." },
  { n: "Mohammed A.", c: "🇦🇪 UAE", t: "Every channel showing the tournament, plus Arabic commentary options. Activation was instant with crypto." },
  { n: "Daniel K.", c: "🇩🇪 Germany", t: "Rock solid during the busiest match nights. Picture quality beats my old satellite box." },
  { n: "Emily R.", c: "🇬🇧 United Kingdom", t: "No blackouts, no buffering. Watched the knockouts on my TV and phone at the same time." },
  { n: "Carlos M.", c: "🇪🇸 Spain", t: "Followed the whole tournament from my laptop while traveling. Worked perfectly everywhere." },
  { n: "Aisha B.", c: "🇨🇦 Canada", t: "Support replied in minutes when I needed help before kick-off. Genuinely 24/7." },
  { n: "Luca F.", c: "🇮🇹 Italy", t: "4K streams looked unreal on the big screen. Best money I've spent this year." },
  { n: "Nina P.", c: "🇳🇱 Netherlands", t: "Free trial convinced me instantly — zero freezing during the live games." },
  { n: "Omar S.", c: "🇸🇦 Saudi Arabia", t: "Tons of sports plus a kids section so the whole family was happy. Highly recommend." },
];

const FAQS = [
  { q: "Can I watch every World Cup 2026 match?", a: "Yes. Our IPTV service carries the channels broadcasting all 104 matches in 4K and HD — from the group stage to the final — with no regional blackouts." },
  { q: "Is there a free trial before the games?", a: "Yes, a free 24-hour trial is available so you can test the picture quality on your own TV before you pay. Open a support ticket to request it." },
  { q: "How fast is activation after I pay?", a: "Crypto payments activate automatically and instantly. Card and PayPal are verified by our team and usually activated within a short time after payment." },
  { q: "Which devices are supported?", a: "Smart TVs, Android, iPhone/iPad, Apple TV, Amazon Firestick, Roku, KODI, MAG boxes, Enigma2, PC, and any device that supports Xtream Codes or M3U playlists." },
  { q: "Will the stream freeze during big matches?", a: "Our load-balanced, anti-freeze servers are built for peak traffic and run at 99.9% uptime, so your stream stays steady even on the busiest match nights." },
  { q: "How many devices can I watch on at once?", a: "It depends on the number of connections you choose at checkout — from 1 up to 10 simultaneous connections." },
  { q: "Do you offer 4K and HD streams?", a: "Yes. We stream in 4K Ultra HD, HD and SD, automatically adapting to your internet speed for the smoothest experience." },
  { q: "What payment methods do you accept?", a: "Cryptocurrency (instant), credit/debit card and PayPal (verified by support), and other methods like bank transfer on request." },
  { q: "The payment page shows a different company name — is that normal?", a: "Yes, that is completely normal and safe. It is simply our payment processor. Go ahead and complete the payment and we'll match it to your order." },
  { q: "Can I watch the World Cup while traveling?", a: "Yes, you can stream anywhere with an internet connection. A stable connection of 15+ Mbps is recommended for 4K." },
  { q: "What internet speed do I need?", a: "About 10 Mbps for HD and 25 Mbps for smooth 4K streaming. A wired or strong Wi-Fi connection is best for live sport." },
  { q: "How do I get help if I am stuck?", a: "Our support team is available 24/7 via live chat and tickets to help with setup, billing, or any question before kick-off." },
];

export default function WorldCup() {
  const { isAuthenticated } = useAuth();
  const { data: plans } = trpc.plans.list.useQuery({ activeOnly: true });
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedConnections, setSelectedConnections] = useState<Record<number, number>>({});
  const [expandedPlans, setExpandedPlans] = useState<Record<number, boolean>>({});
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0, live: false });
  const tTrack = useRef<HTMLDivElement>(null);

  const FEATURES_PREVIEW_COUNT = 6;

  const primaryHref = isAuthenticated ? "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? "Go to Dashboard" : "Start Free Trial";

  // Sticky navbar state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live countdown to the World Cup final
  useEffect(() => {
    const tick = () => {
      const diff = FINAL_DATE - Date.now();
      if (diff <= 0) {
        setCountdown({ d: 0, h: 0, m: 0, s: 0, live: true });
        return;
      }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown({ d, h, m, s, live: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".wc .reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [plans]);

  const getPrice = (plan: NonNullable<typeof plans>[number], connections: number) => {
    const pricing = plan.pricing?.find((p) => p.connections === connections);
    return pricing?.price || "0.00";
  };

  const getPoints = (plan: NonNullable<typeof plans>[number], connections: number) => {
    const tier = plan.pricing?.find((p) => p.connections === connections);
    const tierPoints = (tier as { points?: number } | undefined)?.points ?? 0;
    return tierPoints > 0 ? tierPoints : ((plan as { activationPoints?: number }).activationPoints ?? 0);
  };

  const getConnections = (planId: number) => selectedConnections[planId] || 1;
  const handleConnectionChange = (planId: number, value: number[]) =>
    setSelectedConnections((prev) => ({ ...prev, [planId]: value[0] }));
  const toggleExpanded = (planId: number) =>
    setExpandedPlans((prev) => ({ ...prev, [planId]: !prev[planId] }));

  const scrollT = (dir: number) => {
    const el = tTrack.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".tcard");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 340) + 22), behavior: "smooth" });
  };

  return (
    <div className="wc">
      <style>{css}</style>

      {/* NAVBAR */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <a href="#home" className="logo"><img src={LOGO_URL} alt="IPTV TOP" className="logo-img" /></a>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How it Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#channels">Channels</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-cta">
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn btn-outline">Dashboard</Link>
            ) : (
              <Link href="/login" className="btn btn-outline">Login</Link>
            )}
            <a href="#pricing" className="btn btn-primary">Watch the World Cup</a>
            <button className={`hamburger ${menuOpen ? "open" : ""}`} aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu open" onClick={() => setMenuOpen(false)}>
          <a href="#features">Features</a>
          <a href="#how">How it Works</a>
          <a href="#pricing">Pricing</a>
          <a href="#channels">Channels</a>
          <a href="#faq">FAQ</a>
          <Link href={primaryHref} className="btn btn-primary">{primaryLabel}</Link>
        </div>
      )}

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg" aria-hidden="true">
          <span className="orb orb-1" /><span className="orb orb-2" /><span className="pitch-line" />
        </div>
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow reveal">⚽ FIFA World Cup 2026 · Free 24-Hour Trial</span>
            <h1 className="reveal d1">The Best IPTV Service<br /><span className="grad">to Watch the World Cup 2026</span></h1>
            <p className="lead reveal d2">Stream every World Cup 2026 match live in 4K — no blackouts, no buffering, no cable contract. IPTV TOP gives you 50,000+ live channels and 200,000+ movies and series on any device. Try it free for 24 hours.</p>

            {/* Countdown */}
            <div className="countdown reveal d2" aria-label="Countdown to the World Cup final">
              {countdown.live ? (
                <div className="cd-live"><span className="cd-dot" /> The World Cup is LIVE right now</div>
              ) : (
                <>
                  <span className="cd-label">⏱ Final kicks off in</span>
                  <div className="cd-row">
                    <div className="cd-box"><strong>{countdown.d}</strong><span>days</span></div>
                    <div className="cd-box"><strong>{String(countdown.h).padStart(2, "0")}</strong><span>hrs</span></div>
                    <div className="cd-box"><strong>{String(countdown.m).padStart(2, "0")}</strong><span>min</span></div>
                    <div className="cd-box"><strong>{String(countdown.s).padStart(2, "0")}</strong><span>sec</span></div>
                  </div>
                </>
              )}
            </div>

            <div className="hero-ctas reveal d3">
              <Link href={primaryHref} className="btn btn-primary btn-lg">▶ Start Free Trial</Link>
              <a href="#pricing" className="btn btn-gold btn-lg">⚽ See World Cup Plans</a>
            </div>
            <p className="hero-note reveal d3">No credit card needed for the trial · Cancel anytime · Activates in minutes</p>

            <div className="hero-stats reveal d4">
              <div className="stat"><strong>104</strong><span>Matches Live</span></div>
              <div className="stat"><strong>4K</strong><span>Ultra HD</span></div>
              <div className="stat"><strong>50K+</strong><span>Channels</span></div>
              <div className="stat"><strong>24/7</strong><span>Support</span></div>
            </div>
          </div>
          <div className="hero-visual reveal d2">
            <div className="tv">
              <div className="tv-screen"><div className="play-btn" /></div>
            </div>
            <div className="float-card fc-1"><span className="dot" /> 4K · No Blackouts</div>
            <div className="float-card fc-2">⚽ All 104 Matches</div>
            <div className="float-card fc-3">🏆 Group Stage → Final</div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust-strip">
        <div className="container trust-row">
          <span>⭐ 4.9/5 average rating</span>
          <span>🔒 Secure checkout</span>
          <span>⚡ Instant activation</span>
          <span>🛡 Anti-freeze servers</span>
          <span>💬 24/7 support</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features" id="features">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Built for the Tournament</span>
            <h2>Everything You Need to Watch the World Cup</h2>
            <p>IPTV TOP is built for a clean picture, steady streams on match nights and the freedom to watch on any device.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div className={`feature-card reveal d${(i % 3) + 1}`} key={i}>
                <div className="feature-ic">{f.ic}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
          <div className="reveal" style={{ textAlign: "center", marginTop: "44px" }}>
            <Link href={primaryHref} className="btn btn-primary btn-lg">▶ Start Your Free Trial</Link>
          </div>
        </div>
      </section>

      {/* MID CTA BAND */}
      <section className="cta-band cta-band-dark">
        <div className="container">
          <div className="cta-inner reveal">
            <h2>Kick-off is coming. Be ready.</h2>
            <p>Set up IPTV TOP in minutes and watch every World Cup 2026 match in 4K — risk-free with a 24-hour trial.</p>
            <div className="cta-band-btns">
              <Link href={primaryHref} className="btn btn-gold btn-lg">⚽ Start Free Trial</Link>
              <a href="#pricing" className="btn btn-ghost-light btn-lg">View Plans</a>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING (live plans — same shape as /plans) */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">World Cup Plans</span>
            <h2>Choose Your Plan</h2>
            <p>Select the number of connections you need. Every plan streams the full World Cup in 4K, plus 50,000+ channels and 24/7 support.</p>
          </div>

          {!plans ? (
            <div className="pl-grid reveal">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-96 rounded-xl bg-[#11203a] animate-pulse" />)}
            </div>
          ) : plans.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9fb3d6" }}>Plans are being updated. Please check back soon.</p>
          ) : (
            <div className="pl-grid reveal">
              {plans.map((plan, index) => {
                const connections = getConnections(plan.id);
                const price = getPrice(plan, connections);
                const points = getPoints(plan, connections);
                const isPopular = index === 1;
                const allFeatures = (plan.features as string[]) || [];
                const isExpanded = expandedPlans[plan.id];
                const visibleFeatures = isExpanded ? allFeatures : allFeatures.slice(0, FEATURES_PREVIEW_COUNT);
                const hiddenCount = allFeatures.length - FEATURES_PREVIEW_COUNT;

                return (
                  <Card key={plan.id} className={`relative card-hover ${isPopular ? "border-primary shadow-lg shadow-primary/10" : ""}`}>
                    {plan.promoText && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                        <Badge className="bg-red-500 hover:bg-red-600 text-white">{plan.promoText}</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-xl flex items-center justify-center gap-2">
                        {plan.name}
                        {points > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <span className="p-1.5 rounded-lg bg-amber-500/10 inline-flex">
                              <Coins className="h-5 w-5 text-amber-500" />
                            </span>
                            <span className="text-amber-600 font-bold">+{points}</span>
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="text-center">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold">${price}</span>
                          <span className="text-muted-foreground">/{plan.durationDays} days</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Connections</span>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-bold text-primary">{connections}</span>
                          </div>
                        </div>
                        <Slider
                          value={[connections]}
                          onValueChange={(value) => handleConnectionChange(plan.id, value)}
                          min={1}
                          max={plan.maxConnections}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1</span>
                          <span>{plan.maxConnections}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {visibleFeatures.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                        {hiddenCount > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleExpanded(plan.id)}
                            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                          >
                            {isExpanded ? (<>Show less <ChevronUp className="h-4 w-4" /></>) : (<>Show all features ({hiddenCount} more) <ChevronDown className="h-4 w-4" /></>)}
                          </button>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{connections} simultaneous {connections === 1 ? "device" : "devices"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                          <span>{plan.durationDays} days validity</span>
                        </div>
                        {points > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Coins className="h-4 w-4 text-amber-500 shrink-0" />
                            <span><strong>{points}</strong> activation {points === 1 ? "point" : "points"} for {connections} {connections === 1 ? "connection" : "connections"}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Link
                        href={isAuthenticated ? `/checkout/${plan.id}?connections=${connections}` : `/order/${plan.id}?connections=${connections}`}
                        className="w-full"
                      >
                        <Button className={`w-full ${isPopular ? "gradient-primary" : ""}`} variant={isPopular ? "default" : "outline"}>
                          Select Plan
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="how" id="benefits">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Why Fans Choose Us</span>
            <h2>Why Switch to IPTV TOP for the World Cup</h2>
            <p>Most people switch for one reason: every match in better quality, for far less money. Here's what you get.</p>
          </div>
          <div className="benefits-grid">
            {BENEFITS.map((b, i) => (
              <div className={`benefit reveal d${(i % 4) + 1}`} key={i}>
                <h3>{b.t}</h3>
                <p>{b.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVER STATISTICS */}
      <section className="channels" id="stats">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">By the Numbers</span>
            <h2>Built for Match-Night Traffic</h2>
            <p>A reliable World Cup stream depends on the servers behind it. Here's what keeps IPTV TOP steady.</p>
          </div>
          <div className="count-row">
            <div className="count-box reveal d1"><strong>99.9%</strong><span>Network uptime</span></div>
            <div className="count-box reveal d2"><strong>4K</strong><span>Ultra HD streaming</span></div>
            <div className="count-box reveal d3"><strong>60+</strong><span>Countries covered</span></div>
            <div className="count-box reveal d4"><strong>24/7</strong><span>Human support</span></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Ready in Minutes</span>
            <h2>How It Works</h2>
            <p>From sign-up to your first match in three simple steps.</p>
          </div>
          <div className="steps">
            <div className="step reveal d1"><div className="step-num">1</div><div className="step-ic">🧾</div><h3>Choose Your Plan</h3><p>Pick the subscription length and number of connections that fit your household.</p></div>
            <div className="step reveal d2"><div className="step-num">2</div><div className="step-ic">💳</div><h3>Complete Payment</h3><p>Pay instantly with crypto, or use card / PayPal verified quickly by our support team.</p></div>
            <div className="step reveal d3"><div className="step-num">3</div><div className="step-ic">⚽</div><h3>Start Watching</h3><p>Receive your credentials on your dashboard and stream the World Cup instantly on any device.</p></div>
          </div>
          <div className="reveal" style={{ textAlign: "center", marginTop: "44px" }}>
            <Link href={primaryHref} className="btn btn-primary btn-lg">▶ Get Started Free</Link>
          </div>
        </div>
      </section>

      {/* DEVICES */}
      <section className="devices" id="devices">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Watch Your Way</span>
            <h2>Stream the World Cup on Any Device</h2>
            <p>One subscription, every screen. Watch on multiple devices at once.</p>
          </div>
          <div className="device-grid">
            {DEVICES.map((d, i) => (
              <div className={`device reveal d${(i % 4) + 1}`} key={i}><span className="emoji">{d.e}</span>{d.n}</div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="how" id="compare">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">How We Compare</span>
            <h2>IPTV TOP vs Cable vs Cheap IPTV</h2>
            <p>See how a reliable IPTV service stacks up when it matters most — on match night.</p>
          </div>
          <div className="cmp-wrap reveal">
            <table className="cmp">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className="cmp-us">IPTV TOP</th>
                  <th>Cable TV</th>
                  <th>Cheap IPTV</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Every World Cup match</td><td className="cmp-us">All 104, no blackouts</td><td>Region-locked</td><td>Often missing</td></tr>
                <tr><td>4K quality</td><td className="cmp-us">Yes</td><td>Rare / costly</td><td>Often freezes</td></tr>
                <tr><td>Live channels</td><td className="cmp-us">50,000+</td><td>A few hundred</td><td>Often oversold</td></tr>
                <tr><td>Devices</td><td className="cmp-us">All major</td><td>Box required</td><td>Hit or miss</td></tr>
                <tr><td>Free trial</td><td className="cmp-us">24 hours</td><td>No</td><td>Rarely</td></tr>
                <tr><td>Support</td><td className="cmp-us">24/7 human</td><td>Call queues</td><td>Often none</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CHANNELS */}
      <section className="channels" id="channels">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Endless Content</span>
            <h2>Far More Than the World Cup</h2>
            <p>When the matches pause, there's still everything else — live sports, movies, news and international TV.</p>
          </div>
          <div className="count-row">
            <div className="count-box reveal d1"><strong>50,000+</strong><span>Live TV Channels</span></div>
            <div className="count-box reveal d2"><strong>200,000+</strong><span>Movies & Series</span></div>
            <div className="count-box reveal d3"><strong>60+</strong><span>Countries Covered</span></div>
          </div>
          <div className="cat-grid reveal d2">
            {CATEGORIES.map((c, i) => <span className="cat" key={i}>{c}</span>)}
          </div>
        </div>
      </section>

      {/* FREE TRIAL */}
      <section className="cta-band" id="free-trial">
        <div className="container">
          <div className="cta-inner reveal">
            <h2>Try It Free Before the Next Kick-off</h2>
            <p>Test the picture quality and channels on your own TV for 24 hours. No tricks, no risk.</p>
            <div className="cta-band-btns">
              <Link href={primaryHref} className="btn btn-light btn-lg">Start Free Trial</Link>
              <a href="#pricing" className="btn btn-ghost-light btn-lg">View Plans</a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="reviews">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Loved by Fans</span>
            <h2>What Our Customers Say</h2>
            <p>Real reviews from subscribers streaming the games with us.</p>
          </div>
          <div className="reveal">
            <div className="ttrack" ref={tTrack}>
              {TESTIMONIALS.map((r, i) => (
                <div className="tcard" key={i}>
                  <div className="stars">★★★★★</div>
                  <p>“{r.t}”</p>
                  <div className="treviewer">
                    <div className="tavatar">{r.n.split(" ").map((x) => x[0]).join("").slice(0, 2)}</div>
                    <div><div className="tn">{r.n}</div><div className="tc">{r.c}</div></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="tnav">
              <button onClick={() => scrollT(-1)} aria-label="Previous">‹</button>
              <button onClick={() => scrollT(1)} aria-label="Next">›</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Got Questions?</span>
            <h2>World Cup IPTV — FAQ</h2>
            <p>Quick answers before you start streaming with IPTV TOP.</p>
          </div>
          <div className="faq-list reveal">
            {FAQS.map((f, i) => (
              <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={i}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}<span className="pm">+</span>
                </button>
                <div className="faq-a" style={{ maxHeight: openFaq === i ? "300px" : "0px" }}>
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA BAND */}
      <section className="cta-band cta-band-dark">
        <div className="container">
          <div className="cta-inner reveal">
            <h2>Don't miss a single goal.</h2>
            <p>Join thousands of fans on IPTV TOP. Start your free trial, then pick the plan that fits — set up in minutes, cancel anytime.</p>
            <div className="cta-band-btns">
              <Link href={primaryHref} className="btn btn-gold btn-lg">⚽ {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}</Link>
              <a href="#pricing" className="btn btn-ghost-light btn-lg">View Plans</a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="about-col">
              <a href="#home" className="logo"><img src={LOGO_URL} alt="IPTV TOP" className="logo-img" /></a>
              <p className="about">IPTV TOP is a premium IPTV service streaming every World Cup 2026 match in 4K, plus 50,000+ live channels and 200,000+ movies and series — on every device, with a free 24-hour trial.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <div className="footer-links">
                <a href="#home">Home</a><a href="#pricing">Plans</a><a href="#faq">FAQ</a><a href="#channels">Channels</a>
              </div>
            </div>
            <div>
              <h4>Company</h4>
              <div className="footer-links">
                <a href="#features">Features</a><Link href="/">Main Site</Link><a href="#reviews">Reviews</a>{isAuthenticated ? <Link href="/dashboard">Dashboard</Link> : <Link href="/login">Login</Link>}
              </div>
            </div>
          </div>
          <div className="footer-bottom">© {new Date().getFullYear()} IPTV TOP — Premium IPTV Service. All rights reserved. Not affiliated with or endorsed by FIFA.</div>
        </div>
      </footer>

      {/* STICKY CONVERSION BAR (great for ad traffic) */}
      <div className={`sticky-cta ${scrolled ? "show" : ""}`}>
        <div className="sticky-cta-text">
          <strong>⚽ Watch the World Cup 2026 in 4K</strong>
          <span>Free 24-hour trial · Activates in minutes</span>
        </div>
        <Link href={primaryHref} className="btn btn-gold">Start Free Trial</Link>
      </div>

      {/* Public Live Agent */}
      <PublicAIChatWidget />
    </div>
  );
}

/* ============================ SCOPED STYLES (modern World Cup theme) ============================ */
const css = `
.wc { --white:#fff; --blue-950:#0A1628; --blue-900:#0d1d36; --blue-800:#1E3A8A; --blue-600:#2563EB; --blue-400:#60A5FA; --blue-300:#93C5FD;
  --gold:#F5B301; --gold-2:#ffd24a; --emerald:#10b981;
  --text:#0A1628; --text-muted:#5b6b85; --bg:#ffffff; --bg-soft:#f4f7fe;
  --radius:18px; --radius-sm:12px; --shadow:0 20px 50px -20px rgba(10,22,40,.30); --shadow-glow:0 12px 40px -8px rgba(37,99,235,.45);
  --gradient-primary:linear-gradient(135deg,#2563EB 0%,#1E3A8A 100%);
  --gradient-gold:linear-gradient(135deg,#ffd24a 0%,#F5B301 100%);
  --nav-h:104px;
  font-family:'Inter',system-ui,sans-serif; color:var(--text); background:var(--bg); line-height:1.6; }
.wc * { box-sizing:border-box; }
.wc h1,.wc h2,.wc h3 { font-family:'Poppins','Inter',sans-serif; line-height:1.15; }
.wc a { color:inherit; text-decoration:none; }
.wc ul { list-style:none; margin:0; padding:0; }
.wc .container { width:100%; max-width:1200px; margin:0 auto; padding:0 22px; }
.wc section { position:relative; scroll-margin-top:var(--nav-h); }

.wc .eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:.8rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--blue-600); background:rgba(37,99,235,.1); padding:7px 14px; border-radius:999px; margin-bottom:18px; }
.wc .section-head { max-width:700px; margin:0 auto 54px; text-align:center; }
.wc .section-head h2 { font-size:clamp(1.9rem,4vw,2.9rem); font-weight:800; margin:0 0 14px; }
.wc .section-head p { color:var(--text-muted); font-size:1.05rem; margin:0; }

.wc .btn { display:inline-flex; align-items:center; justify-content:center; gap:9px; font-weight:700; font-size:1rem; padding:13px 24px; border-radius:999px; border:none; cursor:pointer; transition:transform .25s,box-shadow .25s,background .25s,color .25s; white-space:nowrap; }
.wc .btn-primary { background:var(--gradient-primary); color:#fff; box-shadow:0 8px 24px -8px rgba(37,99,235,.7); }
.wc .btn-primary:hover { transform:translateY(-3px); box-shadow:0 16px 38px -8px rgba(37,99,235,.95); }
.wc .btn-gold { background:var(--gradient-gold); color:#1a1300; box-shadow:0 8px 24px -8px rgba(245,179,1,.7); }
.wc .btn-gold:hover { transform:translateY(-3px); box-shadow:0 16px 38px -8px rgba(245,179,1,.95); }
.wc .btn-outline { background:#fff; color:var(--blue-800); border:1.5px solid rgba(37,99,235,.3); }
.wc .btn-outline:hover { transform:translateY(-3px); background:rgba(37,99,235,.06); }
.wc .btn-light { background:#fff; color:var(--blue-800); }
.wc .btn-light:hover { transform:translateY(-3px); box-shadow:0 16px 38px -10px rgba(0,0,0,.4); }
.wc .btn-ghost-light { background:rgba(255,255,255,.12); color:#fff; border:1.5px solid rgba(255,255,255,.55); }
.wc .btn-ghost-light:hover { transform:translateY(-3px); background:rgba(255,255,255,.22); }
.wc .btn-lg { padding:16px 32px; font-size:1.05rem; }

.wc .cta-band { padding:84px 0; background:var(--gradient-primary); color:#fff; }
.wc .cta-band-dark { background:radial-gradient(900px 400px at 80% -20%,rgba(245,179,1,.18),transparent 60%),linear-gradient(135deg,#0A1628 0%,#11254a 100%); }
.wc .cta-inner { text-align:center; max-width:680px; margin:0 auto; }
.wc .cta-inner h2 { font-size:clamp(1.8rem,4vw,2.6rem); font-weight:800; margin:0 0 12px; color:#fff; }
.wc .cta-inner p { color:rgba(255,255,255,.92); font-size:1.05rem; margin:0 0 26px; }
.wc .cta-band-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }

.wc .navbar { position:fixed; top:0; left:0; right:0; z-index:1000; height:var(--nav-h); display:flex; align-items:center; transition:background .35s,box-shadow .35s; background:transparent; }
.wc .navbar.scrolled { background:rgba(255,255,255,.92); backdrop-filter:blur(14px); box-shadow:0 6px 30px -14px rgba(10,22,40,.25); }
.wc .nav-inner { display:flex; align-items:center; justify-content:space-between; width:100%; }
.wc .logo { display:flex; align-items:center; gap:10px; }
.wc .logo-img { height:88px; width:auto; display:block; }
.wc .nav-links { display:flex; align-items:center; gap:32px; }
.wc .nav-links a { color:#2b3a55; font-weight:500; font-size:.98rem; transition:color .2s; }
.wc .nav-links a:hover { color:var(--blue-600); }
.wc .nav-cta { display:flex; align-items:center; gap:10px; }
.wc .hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:8px; }
.wc .hamburger span { width:26px; height:2.5px; background:var(--blue-950); border-radius:2px; transition:transform .3s,opacity .3s; }
.wc .hamburger.open span:nth-child(1){ transform:translateY(7.5px) rotate(45deg);} .wc .hamburger.open span:nth-child(2){opacity:0;} .wc .hamburger.open span:nth-child(3){ transform:translateY(-7.5px) rotate(-45deg);}
.wc .mobile-menu { position:fixed; inset:var(--nav-h) 0 auto 0; z-index:999; background:rgba(255,255,255,.98); backdrop-filter:blur(14px); display:flex; flex-direction:column; gap:4px; padding:18px 22px 26px; box-shadow:var(--shadow); }
.wc .mobile-menu a { color:#2b3a55; font-weight:500; padding:13px 6px; border-bottom:1px solid rgba(10,22,40,.06); }
.wc .mobile-menu .btn { margin-top:14px; }

/* HERO (dark, modern, stadium feel) */
.wc .hero { padding:calc(var(--nav-h) + 64px) 0 96px; position:relative; overflow:hidden;
  background:radial-gradient(1100px 520px at 82% -8%,rgba(37,99,235,.35),transparent 60%),radial-gradient(820px 420px at 4% 6%,rgba(245,179,1,.18),transparent 55%),linear-gradient(180deg,#0A1628 0%,#0d1d36 60%,#11254a 100%); color:#eaf1ff; }
.wc .hero-bg { position:absolute; inset:0; pointer-events:none; }
.wc .hero-bg .orb { position:absolute; border-radius:50%; filter:blur(60px); opacity:.5; }
.wc .hero-bg .orb-1 { width:340px; height:340px; background:rgba(37,99,235,.5); top:-60px; right:-40px; animation:wcfloat 8s ease-in-out infinite; }
.wc .hero-bg .orb-2 { width:280px; height:280px; background:rgba(245,179,1,.35); bottom:-80px; left:-40px; animation:wcfloat 10s ease-in-out infinite; }
.wc .hero-bg .pitch-line { position:absolute; left:50%; top:0; bottom:0; width:2px; background:linear-gradient(180deg,transparent,rgba(255,255,255,.10),transparent); }
.wc .hero-grid { position:relative; z-index:1; display:grid; grid-template-columns:1.08fr .92fr; gap:50px; align-items:center; }
.wc .hero .eyebrow { color:var(--gold-2); background:rgba(245,179,1,.14); }
.wc .hero h1 { font-size:clamp(2.4rem,5.4vw,4rem); font-weight:800; letter-spacing:-.5px; margin:0; color:#fff; }
.wc .hero h1 .grad { background:linear-gradient(120deg,#ffd24a,#F5B301); -webkit-background-clip:text; background-clip:text; color:transparent; }
.wc .hero p.lead { margin:22px 0 24px; font-size:1.18rem; color:#b9c8e6; max-width:560px; }
.wc .hero-note { margin:14px 0 0; font-size:.85rem; color:#8ea3c9; }
.wc .hero-ctas { display:flex; gap:14px; flex-wrap:wrap; }
.wc .hero-stats { display:flex; gap:34px; margin-top:36px; flex-wrap:wrap; }
.wc .hero-stats .stat strong { display:block; font-family:'Poppins'; font-size:1.7rem; color:#fff; }
.wc .hero-stats .stat span { font-size:.85rem; color:#8ea3c9; }

/* Countdown */
.wc .countdown { margin:6px 0 4px; }
.wc .cd-label { display:block; font-size:.82rem; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:var(--gold-2); margin-bottom:10px; }
.wc .cd-row { display:flex; gap:10px; flex-wrap:wrap; }
.wc .cd-box { min-width:64px; text-align:center; padding:10px 12px; border-radius:14px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14); backdrop-filter:blur(6px); }
.wc .cd-box strong { display:block; font-family:'Poppins'; font-size:1.6rem; font-weight:800; color:#fff; line-height:1; }
.wc .cd-box span { font-size:.7rem; text-transform:uppercase; letter-spacing:.08em; color:#8ea3c9; }
.wc .cd-live { display:inline-flex; align-items:center; gap:10px; font-weight:700; color:#fff; background:rgba(16,185,129,.16); border:1px solid rgba(16,185,129,.4); padding:10px 16px; border-radius:999px; }
.wc .cd-dot { width:10px; height:10px; border-radius:50%; background:var(--emerald); box-shadow:0 0 10px var(--emerald); animation:wcpulsedot 1.4s ease-out infinite; }
@keyframes wcpulsedot { 0%{box-shadow:0 0 0 0 rgba(16,185,129,.6);} 100%{box-shadow:0 0 0 12px rgba(16,185,129,0);} }

.wc .hero-visual { position:relative; display:grid; place-items:center; }
.wc .tv { position:relative; width:100%; max-width:460px; aspect-ratio:16/10; border-radius:20px; padding:14px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.16); box-shadow:0 40px 90px -30px rgba(0,0,0,.7); animation:wcfloat 6s ease-in-out infinite; }
.wc .tv-screen { width:100%; height:100%; border-radius:12px; position:relative; overflow:hidden; background:radial-gradient(120% 120% at 30% 20%,#1E3A8A,#06101f 70%); }
.wc .tv-screen::after { content:''; position:absolute; inset:0; background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.16) 50%,transparent 60%); animation:wcsheen 4.5s linear infinite; }
.wc .play-btn { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:74px; height:74px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.3); animation:wcpulse 2.4s ease-out infinite; }
.wc .play-btn::before { content:''; border-style:solid; border-width:12px 0 12px 20px; border-color:transparent transparent transparent #fff; margin-left:5px; }
.wc .float-card { position:absolute; display:flex; align-items:center; gap:9px; background:rgba(255,255,255,.96); border:1px solid rgba(37,99,235,.14); padding:10px 14px; border-radius:14px; font-size:.85rem; color:var(--blue-950); font-weight:700; box-shadow:var(--shadow); animation:wcfloat 5s ease-in-out infinite; }
.wc .float-card .dot { width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 10px #10b981; }
.wc .fc-1 { top:-18px; right:-10px; animation-delay:.4s; } .wc .fc-2 { bottom:26px; left:-26px; animation-delay:1.2s; } .wc .fc-3 { bottom:-16px; right:28px; animation-delay:.8s; }
@keyframes wcfloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }
@keyframes wcsheen { 0%{transform:translateX(-120%);} 60%,100%{transform:translateX(120%);} }
@keyframes wcpulse { 0%{box-shadow:0 0 0 0 rgba(255,255,255,.5);} 100%{box-shadow:0 0 0 24px rgba(255,255,255,0);} }

/* Trust strip */
.wc .trust-strip { background:var(--bg-soft); border-bottom:1px solid rgba(37,99,235,.08); }
.wc .trust-row { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; padding:24px 22px; }
.wc .trust-row span { display:inline-flex; align-items:center; gap:8px; background:#fff; border:1px solid rgba(37,99,235,.18); border-radius:999px; padding:10px 18px; color:var(--blue-950); font-weight:600; font-size:.9rem; box-shadow:0 8px 20px -10px rgba(10,22,40,.28); transition:transform .2s, box-shadow .2s; }
.wc .trust-row span:hover { transform:translateY(-2px); box-shadow:0 10px 22px -10px rgba(37,99,235,.4); }

.wc .features { padding:100px 0; background:var(--bg-soft); }
.wc .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
.wc .feature-card { background:#fff; border:1px solid rgba(37,99,235,.12); border-radius:var(--radius); padding:32px 28px; box-shadow:0 12px 32px -22px rgba(10,22,40,.28); transition:transform .3s,box-shadow .3s,border-color .3s; }
.wc .feature-card:hover { transform:translateY(-8px); box-shadow:var(--shadow); border-color:rgba(37,99,235,.4); }
.wc .feature-ic { width:58px; height:58px; border-radius:16px; display:grid; place-items:center; font-size:1.7rem; background:var(--gradient-primary); color:#fff; box-shadow:var(--shadow-glow); margin-bottom:18px; }
.wc .feature-card h3 { font-size:1.22rem; font-weight:700; margin:0 0 8px; }
.wc .feature-card p { color:var(--text-muted); font-size:.98rem; margin:0; }

.wc .how { padding:100px 0; background:#fff; }
.wc .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:26px; }
.wc .step { text-align:center; padding:38px 26px; border-radius:var(--radius); background:var(--bg-soft); border:1px solid rgba(37,99,235,.1); transition:transform .3s,box-shadow .3s; }
.wc .step:hover { transform:translateY(-6px); box-shadow:var(--shadow); }
.wc .step-num { width:64px; height:64px; margin:0 auto 18px; border-radius:50%; display:grid; place-items:center; font-family:'Poppins'; font-weight:800; font-size:1.5rem; color:#fff; background:var(--gradient-primary); box-shadow:var(--shadow-glow); }
.wc .step-ic { font-size:1.6rem; margin-bottom:10px; }
.wc .step h3 { font-size:1.2rem; margin:0 0 8px; }
.wc .step p { color:var(--text-muted); font-size:.96rem; margin:0; }

.wc .devices { padding:100px 0; background:var(--bg-soft); }
.wc .device-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
.wc .device { display:flex; flex-direction:column; align-items:center; gap:12px; padding:28px 16px; background:#fff; border-radius:var(--radius-sm); border:1px solid rgba(37,99,235,.1); transition:transform .3s,box-shadow .3s,border-color .3s; font-weight:600; font-size:.95rem; }
.wc .device:hover { transform:translateY(-6px); box-shadow:var(--shadow); border-color:rgba(37,99,235,.35); }
.wc .device .emoji { font-size:2.3rem; }

.wc .pricing { padding:100px 0; background:#fff; }
.wc .pl-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; align-items:stretch; }

.wc .channels { padding:100px 0; background:var(--bg-soft); }
.wc .count-row { display:flex; justify-content:center; gap:50px; flex-wrap:wrap; margin-bottom:50px; }
.wc .count-box { text-align:center; }
.wc .count-box strong { display:block; font-family:'Poppins'; font-size:clamp(2.4rem,6vw,3.4rem); font-weight:800; background:linear-gradient(120deg,#2563EB,#1E3A8A); -webkit-background-clip:text; background-clip:text; color:transparent; }
.wc .count-box span { color:var(--text-muted); font-weight:500; }
.wc .cat-grid { display:flex; flex-wrap:wrap; justify-content:center; gap:14px; max-width:900px; margin:0 auto; }
.wc .cat { display:flex; align-items:center; gap:9px; padding:13px 22px; border-radius:999px; background:#fff; border:1px solid rgba(37,99,235,.16); font-weight:600; color:var(--blue-800); transition:transform .25s,background .25s,color .25s; }
.wc .cat:hover { transform:translateY(-4px) scale(1.04); background:var(--gradient-primary); color:#fff; border-color:transparent; }

.wc .testimonials { padding:100px 0; background:#fff; }
.wc .ttrack { display:flex; gap:22px; overflow-x:auto; scroll-snap-type:x mandatory; padding:8px 4px 26px; scroll-behavior:smooth; scrollbar-width:none; }
.wc .ttrack::-webkit-scrollbar { display:none; }
.wc .tcard { scroll-snap-align:start; flex:0 0 340px; max-width:340px; background:#fff; border-radius:var(--radius); border:1px solid rgba(37,99,235,.1); padding:26px; box-shadow:0 10px 30px -18px rgba(10,22,40,.3); }
.wc .stars { color:#fbbf24; font-size:1rem; margin-bottom:12px; letter-spacing:2px; }
.wc .tcard p { color:#2b3a55; font-size:.96rem; margin:0 0 18px; }
.wc .treviewer { display:flex; align-items:center; gap:12px; }
.wc .tavatar { width:44px; height:44px; border-radius:50%; display:grid; place-items:center; font-weight:700; color:#fff; background:var(--gradient-primary); }
.wc .treviewer .tn { font-weight:700; font-size:.95rem; } .wc .treviewer .tc { color:var(--text-muted); font-size:.82rem; }
.wc .tnav { display:flex; justify-content:center; gap:12px; margin-top:6px; }
.wc .tnav button { width:46px; height:46px; border-radius:50%; border:1px solid rgba(37,99,235,.25); background:#fff; cursor:pointer; font-size:1.2rem; color:var(--blue-800); transition:all .2s; }
.wc .tnav button:hover { background:var(--gradient-primary); color:#fff; border-color:transparent; }

.wc .faq { padding:100px 0; background:var(--bg-soft); }
.wc .faq-list { max-width:820px; margin:0 auto; display:flex; flex-direction:column; gap:12px; }
.wc .faq-item { border:1px solid rgba(37,99,235,.14); border-radius:var(--radius-sm); overflow:hidden; background:#fff; transition:border-color .25s; }
.wc .faq-item.open { border-color:var(--blue-600); }
.wc .faq-q { width:100%; text-align:left; background:none; border:none; cursor:pointer; padding:18px 22px; font-size:1rem; font-weight:600; color:var(--text); display:flex; justify-content:space-between; align-items:center; gap:16px; font-family:'Inter'; }
.wc .faq-q .pm { flex-shrink:0; width:26px; height:26px; border-radius:50%; display:grid; place-items:center; background:rgba(37,99,235,.12); color:var(--blue-600); font-size:1.2rem; transition:transform .3s,background .3s,color .3s; }
.wc .faq-item.open .pm { transform:rotate(45deg); background:var(--gradient-primary); color:#fff; }
.wc .faq-a { max-height:0; overflow:hidden; transition:max-height .35s ease; }
.wc .faq-a p { padding:0 22px 20px; color:var(--text-muted); font-size:.95rem; margin:0; }

.wc .footer { background:var(--blue-950); color:#9fb3d6; padding:70px 0 30px; }
.wc .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:40px; margin-bottom:46px; }
.wc .footer .logo { margin-bottom:16px; }
.wc .footer p.about { max-width:360px; font-size:.95rem; margin:0; }
.wc .footer h4 { color:#fff; font-size:1rem; margin:0 0 16px; font-family:'Poppins'; }
.wc .footer-links { display:flex; flex-direction:column; gap:11px; }
.wc .footer-links a { font-size:.93rem; transition:color .2s; }
.wc .footer-links a:hover { color:var(--blue-400); }
.wc .footer-bottom { border-top:1px solid rgba(255,255,255,.1); padding-top:24px; text-align:center; font-size:.88rem; }

/* Benefits */
.wc .benefits-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
.wc .benefit { background:#fff; border:1px solid rgba(37,99,235,.14); border-left:4px solid var(--gold); border-radius:var(--radius-sm); padding:26px 22px; box-shadow:0 14px 34px -20px rgba(10,22,40,.30); transition:transform .3s, box-shadow .3s; }
.wc .benefit:hover { transform:translateY(-6px); box-shadow:0 22px 48px -22px rgba(10,22,40,.34); }
.wc .benefit h3 { font-size:1.1rem; margin:0 0 8px; }
.wc .benefit p { color:var(--text-muted); font-size:.95rem; margin:0; }

/* Comparison table */
.wc .cmp-wrap { max-width:920px; margin:0 auto; overflow-x:auto; border:1px solid rgba(37,99,235,.14); border-radius:var(--radius); }
.wc .cmp { width:100%; border-collapse:collapse; min-width:560px; }
.wc .cmp th, .wc .cmp td { padding:14px 16px; text-align:left; border-bottom:1px solid rgba(37,99,235,.1); font-size:.95rem; }
.wc .cmp thead th { background:var(--bg-soft); font-weight:700; }
.wc .cmp tbody tr:last-child td { border-bottom:none; }
.wc .cmp .cmp-us { background:rgba(245,179,1,.12); color:var(--blue-800); font-weight:700; }

/* Sticky conversion bar */
.wc .sticky-cta { position:fixed; left:0; right:0; bottom:0; z-index:900; display:flex; align-items:center; justify-content:center; gap:18px; padding:12px 18px; background:rgba(10,22,40,.96); backdrop-filter:blur(10px); border-top:1px solid rgba(245,179,1,.35); box-shadow:0 -10px 30px -12px rgba(0,0,0,.5); transform:translateY(120%); transition:transform .35s ease; }
.wc .sticky-cta.show { transform:translateY(0); }
.wc .sticky-cta-text { display:flex; flex-direction:column; line-height:1.25; }
.wc .sticky-cta-text strong { color:#fff; font-size:.98rem; }
.wc .sticky-cta-text span { color:#9fb3d6; font-size:.8rem; }
.wc .sticky-cta .btn { padding:11px 22px; }

.wc .reveal { opacity:0; transform:translateY(40px); transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1); }
.wc .reveal.visible { opacity:1; transform:translateY(0); }
.wc .reveal.d1{transition-delay:.08s;} .wc .reveal.d2{transition-delay:.16s;} .wc .reveal.d3{transition-delay:.24s;} .wc .reveal.d4{transition-delay:.32s;}

@media (max-width:980px){
  .wc .hero-grid{grid-template-columns:1fr; text-align:center;}
  .wc .hero p.lead{margin-left:auto; margin-right:auto;}
  .wc .hero-ctas,.wc .hero-stats,.wc .countdown .cd-row{justify-content:center;}
  .wc .countdown{display:flex; flex-direction:column; align-items:center;}
  .wc .hero-visual{order:-1; margin-bottom:10px;}
  .wc .features-grid{grid-template-columns:repeat(2,1fr);}
  .wc .steps{grid-template-columns:1fr;}
  .wc .device-grid{grid-template-columns:repeat(3,1fr);}
  .wc .pl-grid{grid-template-columns:repeat(2,1fr);}
  .wc .benefits-grid{grid-template-columns:repeat(2,1fr);}
  .wc .footer-grid{grid-template-columns:1fr 1fr;}
  .wc .footer .about-col{grid-column:1 / -1;}
}
@media (max-width:640px){
  .wc .nav-links{display:none;} .wc .nav-cta .btn-outline{display:none;}
  .wc .hamburger{display:flex;}
  .wc .logo-img{ height:58px; }
  .wc .features-grid{grid-template-columns:1fr;}
  .wc .device-grid{grid-template-columns:repeat(2,1fr);}
  .wc .pl-grid{grid-template-columns:1fr;}
  .wc .benefits-grid{grid-template-columns:1fr;}
  .wc .footer-grid{grid-template-columns:1fr;}
  .wc .sticky-cta-text span{display:none;}
  .wc .sticky-cta{gap:12px;}
}
`;
