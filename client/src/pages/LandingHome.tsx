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

/* Marketing homepage (public). White theme, live pricing from the real plans,
   and a public Live Agent chat. Served at "/" for visitors. */

const TESTIMONIALS = [
  { n: "James W.", c: "🇺🇸 United States", t: "Switched from cable and never looked back. The 4K streams are flawless and sports never buffer." },
  { n: "Sophie L.", c: "🇫🇷 France", t: "Setup took five minutes and support helped me on my Firestick instantly. Huge channel list!" },
  { n: "Mohammed A.", c: "🇦🇪 UAE", t: "Best Arabic and international channels I've found. Activation was instant with crypto." },
  { n: "Daniel K.", c: "🇩🇪 Germany", t: "Rock solid uptime during the whole football season. Worth every cent." },
  { n: "Emily R.", c: "🇬🇧 United Kingdom", t: "The VOD library is massive — feels like every streaming app in one place." },
  { n: "Carlos M.", c: "🇪🇸 Spain", t: "Works perfectly on my Smart TV and phone at the same time. Great value." },
  { n: "Aisha B.", c: "🇨🇦 Canada", t: "Customer support is genuinely 24/7. They replied within minutes at 2am." },
  { n: "Luca F.", c: "🇮🇹 Italy", t: "Picture quality is unreal in 4K. The free player on the yearly plan sealed it for me." },
  { n: "Nina P.", c: "🇳🇱 Netherlands", t: "No freezing, no downtime. Finally an iptv service that just works." },
  { n: "Omar S.", c: "🇸🇦 Saudi Arabia", t: "Tons of channels and the kids section keeps my family happy. Highly recommend." },
  { n: "Grace T.", c: "🇦🇺 Australia", t: "Streaming from the other side of the world with zero lag. Impressed." },
  { n: "Pierre D.", c: "🇧🇪 Belgium", t: "Paid by card, got activated fast after verification. Smooth experience overall." },
  { n: "Yuki H.", c: "🇯🇵 Japan", t: "Great mix of international content and clean apps. Easy to navigate." },
  { n: "Liam O.", c: "🇮🇪 Ireland", t: "PPV events included is a game changer. Cancelled my other subscriptions." },
  { n: "Fatima Z.", c: "🇲🇦 Morocco", t: "Excellent quality and the price is unbeatable. Support speaks my language too." },
];

const FAQS = [
  { q: "What is IPTV and how does it work?", a: "IPTV streams live TV and on-demand content over the internet instead of cable or satellite. You just need an internet connection and a compatible device or app." },
  { q: "How fast is activation after I pay?", a: "Crypto payments activate automatically and instantly. Card and PayPal are verified by our team and usually activated within a short time after payment." },
  { q: "Which devices are supported?", a: "Smart TVs, Android, iPhone/iPad, Apple TV, Amazon Firestick, Roku, KODI, MAG boxes, Enigma2, PC, and any device that supports Xtream Codes or M3U playlists." },
  { q: "How many devices can I watch on at once?", a: "It depends on the number of connections you choose at checkout — from 1 up to 10 simultaneous connections." },
  { q: "Is there a free trial?", a: "Yes, a free 24-hour trial is available so you can test the service before subscribing. Open a support ticket to request it." },
  { q: "Do you offer 4K and HD streams?", a: "Yes. We stream in 4K Ultra HD, HD and SD, automatically adapting to your internet speed for the smoothest experience." },
  { q: "How many channels and VOD titles are there?", a: "Over 50,000 live channels and more than 200,000 movies and series, with the library updated daily." },
  { q: "What payment methods do you accept?", a: "Cryptocurrency (instant), credit/debit card and PayPal (verified by support), and other methods like bank transfer on request." },
  { q: "Is my payment secure?", a: "Yes. Payments are processed through secure providers. Card and PayPal go through a protected payment link." },
  { q: "The payment page shows a different company name — is that normal?", a: "Yes, that is completely normal and safe. It is simply our payment processor. Go ahead and complete the payment and we'll match it to your order." },
  { q: "How do I receive my login credentials?", a: "After activation, your credentials appear on your dashboard, and you also receive an email with the status." },
  { q: "Can I use IPTV while traveling?", a: "Yes, you can stream anywhere with an internet connection. A stable connection of 15+ Mbps is recommended for 4K." },
  { q: "Do you include sports and PPV events?", a: "Yes, major sports channels and Pay-Per-View events are included so you never miss the action." },
  { q: "Is adult content included?", a: "There is an optional adult (18+) section that you can choose to include or exclude at any time." },
  { q: "What internet speed do I need?", a: "About 10 Mbps for HD and 25 Mbps for smooth 4K streaming. A wired or strong Wi-Fi connection is best." },
  { q: "Can I upgrade my plan or add connections later?", a: "Yes, you can change your plan or add more connections at any time from the members area or by contacting support." },
  { q: "What if a channel is not working?", a: "Our team monitors streams 24/7. If you spot an issue, contact support and we'll fix it quickly." },
  { q: "Do you offer refunds?", a: "Refund requests are handled case by case by our support team. Please open a support ticket to discuss your situation." },
  { q: "Will it work on my old device?", a: "As long as the device supports a compatible IPTV app (Xtream Codes or M3U), it will work. Support can recommend the best app." },
  { q: "How do I get help if I am stuck?", a: "Our support team is available 24/7 via live chat and support tickets to help with setup, billing, or any question." },
];

const FEATURES = [
  { ic: "📡", t: "50,000+ Live Channels", d: "Live TV from around the world — sports, news, kids, movies and more — refreshed every day." },
  { ic: "🎬", t: "True 4K & HD Quality", d: "Sharp 4K, HD and SD streams that adjust to your connection so the picture stays smooth." },
  { ic: "⚡", t: "99.9% Uptime", d: "Load-balanced servers and anti-freeze delivery keep your stream steady, even on busy match nights." },
  { ic: "📱", t: "Works on Every Device", d: "Use the apps you already have on Smart TV, Firestick, Android, iPhone, MAG, Enigma2 and PC." },
  { ic: "🍿", t: "200,000+ Movies & Series", d: "A huge on-demand library with your watchlist and favorites synced across every screen." },
  { ic: "💬", t: "24/7 Human Support", d: "A real team you can reach any time for setup, billing or a quick question." },
];

const BENEFITS = [
  { t: "Spend less", d: "One IPTV subscription replaces a pricey cable bill and several streaming apps." },
  { t: "Keep your devices", d: "No dish, no box. Our IPTV service runs on the hardware you already own." },
  { t: "More to watch", d: "Live sports, PPV, worldwide channels and a deep movie library, all in one place." },
  { t: "No lock-in", d: "Simple plans you can change anytime, plus a free trial so you never buy blind." },
];

const DEVICES = [
  { e: "📺", n: "Smart TV" }, { e: "🤖", n: "Android" }, { e: "📱", n: "iPhone & iPad" }, { e: "🔥", n: "Firestick" },
  { e: "📦", n: "MAG Box" }, { e: "💻", n: "PC / Laptop" }, { e: "🍎", n: "Apple TV" }, { e: "🟣", n: "Roku" },
];

const CATEGORIES = ["⚽ Sports", "🎬 Movies", "📰 News", "🧒 Kids", "🕌 Arabic", "🇫🇷 French", "🎭 Entertainment", "📚 Documentary", "🎵 Music", "🏆 PPV Events", "🌍 International", "📺 4K Premium"];

export default function LandingHome() {
  const { isAuthenticated } = useAuth();
  const { data: plans } = trpc.plans.list.useQuery({ activeOnly: true });
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedConnections, setSelectedConnections] = useState<Record<number, number>>({});
  const [expandedPlans, setExpandedPlans] = useState<Record<number, boolean>>({});
  const tTrack = useRef<HTMLDivElement>(null);

  const FEATURES_PREVIEW_COUNT = 6;

  // Where primary CTAs should point depending on auth state
  const primaryHref = isAuthenticated ? "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? "Go to Dashboard" : "Login / Sign Up";

  // Sticky navbar state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
    document.querySelectorAll(".lp .reveal").forEach((el) => obs.observe(el));
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
    <div className="lp">
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
            <a href="#pricing" className="btn btn-primary">Get Started</a>
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
        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow reveal">⭐ Best IPTV Service 2026 · Free 24-Hour Trial</span>
            <h1 className="reveal d1">The Top IPTV Service.<br /><span className="grad">Watch More, Pay Less.</span></h1>
            <p className="lead reveal d2">IPTV TOP gives you 50,000+ live channels and 200,000+ movies and series in 4K, HD and SD — on any device, with instant setup. Try our IPTV service free for 24 hours before you decide.</p>
            <div className="hero-ctas reveal d3">
              <Link href={primaryHref} className="btn btn-primary btn-lg">▶ Start Free Trial</Link>
              <a href="#pricing" className="btn btn-outline btn-lg">View Plans</a>
            </div>
            <div className="hero-stats reveal d4">
              <div className="stat"><strong>50K+</strong><span>Live Channels</span></div>
              <div className="stat"><strong>200K+</strong><span>Movies & Series</span></div>
              <div className="stat"><strong>99.9%</strong><span>Uptime</span></div>
              <div className="stat"><strong>24/7</strong><span>Support</span></div>
            </div>
          </div>
          <div className="hero-visual reveal d2">
            <div className="tv">
              <div className="tv-screen"><div className="play-btn" /></div>
            </div>
            <div className="float-card fc-1"><span className="dot" /> 4K Ultra HD</div>
            <div className="float-card fc-2">⚽ Live Sports & PPV</div>
            <div className="float-card fc-3">🎬 200K+ VOD</div>
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
            <span className="eyebrow">Why Choose Us</span>
            <h2>Everything You Want From a Top IPTV Service</h2>
            <p>IPTV TOP is built for a clean picture, steady streams and the freedom to watch on any device.</p>
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
        </div>
      </section>

      {/* PRICING (live plans — same shape as /plans) */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Simple Pricing</span>
            <h2>Choose Your Plan</h2>
            <p>Select the number of connections you need. All plans include premium channels, HD quality, and 24/7 support.</p>
          </div>

          {!plans ? (
            <div className="pl-grid reveal">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-96 rounded-xl bg-[#eef3fc] animate-pulse" />)}
            </div>
          ) : plans.length === 0 ? (
            <p style={{ textAlign: "center", color: "#5b6b85" }}>Plans are being updated. Please check back soon.</p>
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
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
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
            <span className="eyebrow">Why Switch</span>
            <h2>Why Viewers Move to IPTV TOP</h2>
            <p>Most people switch for one reason: a better picture for less money. Here's what you get with our IPTV service.</p>
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
            <h2>Built for Reliability</h2>
            <p>A top IPTV service depends on its servers. Here's what keeps IPTV TOP steady.</p>
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
            <span className="eyebrow">Get Started in Minutes</span>
            <h2>How It Works</h2>
            <p>From sign-up to streaming in three simple steps.</p>
          </div>
          <div className="steps">
            <div className="step reveal d1"><div className="step-num">1</div><div className="step-ic">🧾</div><h3>Choose Your Plan</h3><p>Pick the subscription length and number of connections that fit your household.</p></div>
            <div className="step reveal d2"><div className="step-num">2</div><div className="step-ic">💳</div><h3>Complete Payment</h3><p>Pay instantly with crypto, or use card / PayPal verified quickly by our support team.</p></div>
            <div className="step reveal d3"><div className="step-num">3</div><div className="step-ic">🚀</div><h3>Start Watching</h3><p>Receive your credentials on your dashboard and start streaming instantly on any device.</p></div>
          </div>
          <div className="reveal" style={{ textAlign: "center", marginTop: "44px" }}>
            <a href="#pricing" className="btn btn-primary btn-lg">See Plans &amp; Pricing</a>
          </div>
        </div>
      </section>

      {/* DEVICES */}
      <section className="devices" id="devices">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Watch Your Way</span>
            <h2>Works on All Your Devices</h2>
            <p>One subscription, every screen. Stream on multiple devices at once.</p>
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
            <p>See how a reliable IPTV service stacks up against cable and bargain providers.</p>
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
                <tr><td>Live channels</td><td className="cmp-us">50,000+</td><td>A few hundred</td><td>Often oversold</td></tr>
                <tr><td>Movies & series</td><td className="cmp-us">200,000+</td><td>Limited / rentals</td><td>Small, outdated</td></tr>
                <tr><td>4K quality</td><td className="cmp-us">Yes</td><td>Rare / costly</td><td>Often freezes</td></tr>
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
            <h2>A Channel for Every Mood</h2>
            <p>From live sports to kids' shows, international TV to blockbuster movies — it's all here.</p>
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
            <h2>Try Our IPTV Service Free for 24 Hours</h2>
            <p>Test the picture quality and channels on your own TV before you pay. No tricks, no risk.</p>
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
            <span className="eyebrow">Loved by Thousands</span>
            <h2>What Our Customers Say</h2>
            <p>Real reviews from subscribers streaming with us every day.</p>
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
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers about our IPTV service before you start with IPTV TOP.</p>
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

      {/* PAYMENT */}
      <section className="payment" id="payment">
        <div className="container">
          <div className="section-head reveal">
            <span className="eyebrow">Flexible & Safe</span>
            <h2>Simple & Secure Checkout</h2>
            <p>Pay the way you prefer. All payments are processed securely.</p>
          </div>
          <div className="pay-grid">
            <div className="pay-card reveal d1">
              <span className="badge badge-instant">⚡ Instant Activation</span>
              <h3>Automatic — Crypto</h3>
              <p>Pay with cryptocurrency and your subscription activates automatically the moment the payment is confirmed. No waiting.</p>
              <div className="pay-methods">
                <span className="pay-pill">₿ Bitcoin</span><span className="pay-pill">Ξ Ethereum</span><span className="pay-pill">₮ USDT</span><span className="pay-pill">🪙 100+ coins</span>
              </div>
            </div>
            <div className="pay-card reveal d2">
              <span className="badge badge-manual">🛡 Verified by Support</span>
              <h3>Manual — Card & PayPal</h3>
              <p>Pay by card or PayPal through a secure payment link. Our team verifies it quickly and activates your account — usually within a short time.</p>
              <div className="pay-methods">
                <span className="pay-pill">💳 Visa</span><span className="pay-pill">💳 Mastercard</span><span className="pay-pill">🅿️ PayPal</span><span className="pay-pill">🏦 Bank Transfer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA BAND */}
      <section className="cta-band">
        <div className="container">
          <div className="cta-inner reveal">
            <h2>Ready to start watching?</h2>
            <p>Join thousands of viewers on IPTV TOP. Start your free trial, then pick the plan that fits — set up in minutes, cancel anytime.</p>
            <div className="cta-band-btns">
              <Link href={primaryHref} className="btn btn-light btn-lg">▶ {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}</Link>
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
              <p className="about">IPTV TOP is a premium IPTV service streaming 50,000+ live channels and 200,000+ movies and series in 4K, HD and SD — on every device, with a free 24-hour trial.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <div className="footer-links">
                <a href="#home">Home</a><a href="#pricing">Plans</a><a href="#faq">FAQ</a><a href="#payment">Payments</a>
              </div>
            </div>
            <div>
              <h4>Company</h4>
              <div className="footer-links">
                <a href="#features">Features</a><a href="#channels">Channels</a><a href="#reviews">Reviews</a>{isAuthenticated ? <Link href="/dashboard">Dashboard</Link> : <Link href="/login">Login</Link>}
              </div>
            </div>
          </div>
          <div className="footer-bottom">© {new Date().getFullYear()} IPTV TOP — Premium IPTV Service. All rights reserved.</div>
        </div>
      </footer>

      {/* Public Live Agent */}
      <PublicAIChatWidget />
    </div>
  );
}

/* ============================ SCOPED STYLES (white theme) ============================ */
const css = `
.lp { --white:#fff; --blue-950:#0A1628; --blue-800:#1E3A8A; --blue-600:#2563EB; --blue-400:#60A5FA; --blue-300:#93C5FD;
  --text:#0A1628; --text-muted:#5b6b85; --bg:#ffffff; --bg-soft:#f4f7fe;
  --radius:18px; --radius-sm:12px; --shadow:0 20px 50px -20px rgba(10,22,40,.30); --shadow-glow:0 12px 40px -8px rgba(37,99,235,.45);
  --gradient-primary:linear-gradient(135deg,#2563EB 0%,#1E3A8A 100%); --nav-h:104px;
  font-family:'Inter',system-ui,sans-serif; color:var(--text); background:var(--bg); line-height:1.6; }
.lp * { box-sizing:border-box; }
.lp h1,.lp h2,.lp h3 { font-family:'Poppins','Inter',sans-serif; line-height:1.15; }
.lp a { color:inherit; text-decoration:none; }
.lp ul { list-style:none; margin:0; padding:0; }
.lp .container { width:100%; max-width:1200px; margin:0 auto; padding:0 22px; }
.lp section { position:relative; scroll-margin-top:var(--nav-h); }

.lp .eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:.8rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--blue-600); background:rgba(37,99,235,.1); padding:7px 14px; border-radius:999px; margin-bottom:18px; }
.lp .section-head { max-width:680px; margin:0 auto 54px; text-align:center; }
.lp .section-head h2 { font-size:clamp(1.9rem,4vw,2.9rem); font-weight:800; margin:0 0 14px; }
.lp .section-head p { color:var(--text-muted); font-size:1.05rem; margin:0; }

.lp .btn { display:inline-flex; align-items:center; justify-content:center; gap:9px; font-weight:600; font-size:1rem; padding:13px 24px; border-radius:999px; border:none; cursor:pointer; transition:transform .25s,box-shadow .25s,background .25s,color .25s; white-space:nowrap; }
.lp .btn-primary { background:var(--gradient-primary); color:#fff; box-shadow:0 8px 24px -8px rgba(37,99,235,.7); }
.lp .btn-primary:hover { transform:translateY(-3px); box-shadow:0 16px 38px -8px rgba(37,99,235,.95); }
.lp .btn-outline { background:#fff; color:var(--blue-800); border:1.5px solid rgba(37,99,235,.3); }
.lp .btn-outline:hover { transform:translateY(-3px); background:rgba(37,99,235,.06); }
.lp .btn-light { background:#fff; color:var(--blue-800); }
.lp .btn-light:hover { transform:translateY(-3px); box-shadow:0 16px 38px -10px rgba(0,0,0,.4); }
.lp .btn-ghost-light { background:rgba(255,255,255,.12); color:#fff; border:1.5px solid rgba(255,255,255,.55); }
.lp .btn-ghost-light:hover { transform:translateY(-3px); background:rgba(255,255,255,.22); }
.lp .cta-band { padding:84px 0; background:var(--gradient-primary); color:#fff; }
.lp .cta-inner { text-align:center; max-width:640px; margin:0 auto; }
.lp .cta-inner h2 { font-size:clamp(1.8rem,4vw,2.6rem); font-weight:800; margin:0 0 12px; color:#fff; }
.lp .cta-inner p { color:rgba(255,255,255,.92); font-size:1.05rem; margin:0 0 26px; }
.lp .cta-band-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
.lp .btn-lg { padding:16px 32px; font-size:1.05rem; }

.lp .navbar { position:fixed; top:0; left:0; right:0; z-index:1000; height:var(--nav-h); display:flex; align-items:center; transition:background .35s,box-shadow .35s; background:transparent; }
.lp .navbar.scrolled { background:rgba(255,255,255,.9); backdrop-filter:blur(14px); box-shadow:0 6px 30px -14px rgba(10,22,40,.25); }
.lp .nav-inner { display:flex; align-items:center; justify-content:space-between; width:100%; }
.lp .logo { display:flex; align-items:center; gap:10px; font-family:'Poppins'; font-weight:800; font-size:1.3rem; color:var(--blue-950); }
.lp .logo-mark { width:38px; height:38px; border-radius:11px; display:grid; place-items:center; background:var(--gradient-primary); box-shadow:var(--shadow-glow); font-size:1.1rem; }
.lp .logo span { color:var(--blue-600); }
.lp .logo-img { height:88px; width:auto; display:block; }
.lp .nav-links { display:flex; align-items:center; gap:32px; }
.lp .nav-links a { color:#2b3a55; font-weight:500; font-size:.98rem; transition:color .2s; }
.lp .nav-links a:hover { color:var(--blue-600); }
.lp .nav-cta { display:flex; align-items:center; gap:10px; }
.lp .hamburger { display:none; flex-direction:column; gap:5px; background:none; border:none; cursor:pointer; padding:8px; }
.lp .hamburger span { width:26px; height:2.5px; background:var(--blue-950); border-radius:2px; transition:transform .3s,opacity .3s; }
.lp .hamburger.open span:nth-child(1){ transform:translateY(7.5px) rotate(45deg);} .lp .hamburger.open span:nth-child(2){opacity:0;} .lp .hamburger.open span:nth-child(3){ transform:translateY(-7.5px) rotate(-45deg);}
.lp .mobile-menu { position:fixed; inset:var(--nav-h) 0 auto 0; z-index:999; background:rgba(255,255,255,.98); backdrop-filter:blur(14px); display:flex; flex-direction:column; gap:4px; padding:18px 22px 26px; box-shadow:var(--shadow); }
.lp .mobile-menu a { color:#2b3a55; font-weight:500; padding:13px 6px; border-bottom:1px solid rgba(10,22,40,.06); }
.lp .mobile-menu .btn { margin-top:14px; }

.lp .hero { padding:calc(var(--nav-h) + 70px) 0 90px; background:radial-gradient(1100px 500px at 80% -10%,rgba(37,99,235,.12),transparent 60%),radial-gradient(800px 400px at 0% 10%,rgba(96,165,250,.14),transparent 55%),linear-gradient(180deg,#ffffff 0%,#f4f7fe 100%); overflow:hidden; }
.lp .hero-grid { display:grid; grid-template-columns:1.05fr .95fr; gap:50px; align-items:center; }
.lp .hero h1 { font-size:clamp(2.4rem,5.4vw,4rem); font-weight:800; letter-spacing:-.5px; margin:0; }
.lp .hero h1 .grad { background:linear-gradient(120deg,#2563EB,#1E3A8A); -webkit-background-clip:text; background-clip:text; color:transparent; }
.lp .hero p.lead { margin:22px 0 30px; font-size:1.18rem; color:var(--text-muted); max-width:540px; }
.lp .hero-ctas { display:flex; gap:14px; flex-wrap:wrap; }
.lp .hero-stats { display:flex; gap:34px; margin-top:40px; flex-wrap:wrap; }
.lp .hero-stats .stat strong { display:block; font-family:'Poppins'; font-size:1.7rem; color:var(--blue-800); }
.lp .hero-stats .stat span { font-size:.85rem; color:var(--text-muted); }
.lp .hero-visual { position:relative; display:grid; place-items:center; }
.lp .tv { position:relative; width:100%; max-width:460px; aspect-ratio:16/10; border-radius:20px; padding:14px; background:#fff; border:1px solid rgba(37,99,235,.16); box-shadow:0 40px 90px -30px rgba(37,99,235,.5); animation:lpfloat 6s ease-in-out infinite; }
.lp .tv-screen { width:100%; height:100%; border-radius:12px; position:relative; overflow:hidden; background:radial-gradient(120% 120% at 30% 20%,#1E3A8A,#0A1628 70%); }
.lp .tv-screen::after { content:''; position:absolute; inset:0; background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.16) 50%,transparent 60%); animation:lpsheen 4.5s linear infinite; }
.lp .play-btn { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:74px; height:74px; border-radius:50%; display:grid; place-items:center; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.3); box-shadow:0 0 0 0 rgba(96,165,250,.5); animation:lppulse 2.4s ease-out infinite; }
.lp .play-btn::before { content:''; border-style:solid; border-width:12px 0 12px 20px; border-color:transparent transparent transparent #fff; margin-left:5px; }
.lp .float-card { position:absolute; display:flex; align-items:center; gap:9px; background:#fff; border:1px solid rgba(37,99,235,.14); padding:10px 14px; border-radius:14px; font-size:.85rem; color:var(--blue-950); font-weight:600; box-shadow:var(--shadow); animation:lpfloat 5s ease-in-out infinite; }
.lp .float-card .dot { width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 10px #10b981; }
.lp .fc-1 { top:-18px; right:-10px; animation-delay:.4s; } .lp .fc-2 { bottom:26px; left:-26px; animation-delay:1.2s; } .lp .fc-3 { bottom:-16px; right:28px; animation-delay:.8s; }
@keyframes lpfloat { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }
@keyframes lpsheen { 0%{transform:translateX(-120%);} 60%,100%{transform:translateX(120%);} }
@keyframes lppulse { 0%{box-shadow:0 0 0 0 rgba(96,165,250,.5);} 100%{box-shadow:0 0 0 24px rgba(96,165,250,0);} }

.lp .features { padding:100px 0; background:var(--bg-soft); }
.lp .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
.lp .feature-card { background:#fff; border:1px solid rgba(37,99,235,.12); border-radius:var(--radius); padding:32px 28px; box-shadow:0 12px 32px -22px rgba(10,22,40,.28); transition:transform .3s,box-shadow .3s,border-color .3s; }
.lp .feature-card:hover { transform:translateY(-8px); box-shadow:var(--shadow); border-color:rgba(37,99,235,.4); }
.lp .feature-ic { width:58px; height:58px; border-radius:16px; display:grid; place-items:center; font-size:1.7rem; background:var(--gradient-primary); color:#fff; box-shadow:var(--shadow-glow); margin-bottom:18px; }
.lp .feature-card h3 { font-size:1.22rem; font-weight:700; margin:0 0 8px; }
.lp .feature-card p { color:var(--text-muted); font-size:.98rem; margin:0; }

.lp .how { padding:100px 0; background:#fff; }
.lp .steps { display:grid; grid-template-columns:repeat(3,1fr); gap:26px; }
.lp .step { text-align:center; padding:38px 26px; border-radius:var(--radius); background:var(--bg-soft); border:1px solid rgba(37,99,235,.1); transition:transform .3s,box-shadow .3s; }
.lp .step:hover { transform:translateY(-6px); box-shadow:var(--shadow); }
.lp .step-num { width:64px; height:64px; margin:0 auto 18px; border-radius:50%; display:grid; place-items:center; font-family:'Poppins'; font-weight:800; font-size:1.5rem; color:#fff; background:var(--gradient-primary); box-shadow:var(--shadow-glow); }
.lp .step-ic { font-size:1.6rem; margin-bottom:10px; }
.lp .step h3 { font-size:1.2rem; margin:0 0 8px; }
.lp .step p { color:var(--text-muted); font-size:.96rem; margin:0; }

.lp .devices { padding:100px 0; background:var(--bg-soft); }
.lp .device-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:18px; }
.lp .device { display:flex; flex-direction:column; align-items:center; gap:12px; padding:28px 16px; background:#fff; border-radius:var(--radius-sm); border:1px solid rgba(37,99,235,.1); transition:transform .3s,box-shadow .3s,border-color .3s; font-weight:600; font-size:.95rem; }
.lp .device:hover { transform:translateY(-6px); box-shadow:var(--shadow); border-color:rgba(37,99,235,.35); }
.lp .device .emoji { font-size:2.3rem; }

.lp .pricing { padding:100px 0; background:#fff; }
.lp .plans { display:grid; grid-template-columns:repeat(4,1fr); gap:22px; align-items:stretch; }
.lp .plan { display:flex; flex-direction:column; background:#fff; border-radius:var(--radius); border:1px solid rgba(37,99,235,.14); padding:30px 26px; position:relative; transition:transform .3s,box-shadow .3s; }
.lp .plan:hover { transform:translateY(-8px); box-shadow:var(--shadow); }
.lp .plan.popular { border:2px solid var(--blue-600); box-shadow:var(--shadow-glow); }
.lp .plan.skeleton-card { min-height:420px; background:linear-gradient(100deg,#eef3fc 30%,#f7faff 50%,#eef3fc 70%); background-size:200% 100%; animation:lpshimmer 1.4s infinite; border-color:transparent; }
@keyframes lpshimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
.lp .plan-badge { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:var(--gradient-primary); color:#fff; font-size:.72rem; font-weight:700; letter-spacing:.04em; text-transform:uppercase; padding:6px 14px; border-radius:999px; white-space:nowrap; }
.lp .plan h3 { font-size:1.05rem; letter-spacing:.04em; text-transform:uppercase; color:var(--text-muted); margin:0 0 6px; }
.lp .plan .price { font-family:'Poppins'; font-size:2.6rem; font-weight:800; color:var(--blue-800); }
.lp .plan .per { color:var(--text-muted); font-size:.88rem; margin-bottom:18px; }
.lp .plan ul { display:flex; flex-direction:column; gap:10px; margin:18px 0 24px; }
.lp .plan li { display:flex; gap:9px; font-size:.92rem; color:#2b3a55; }
.lp .plan li .ck { color:var(--blue-600); font-weight:800; }
.lp .plan .btn { margin-top:auto; }
.lp .pl-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; align-items:stretch; }

.lp .channels { padding:100px 0; background:var(--bg-soft); }
.lp .count-row { display:flex; justify-content:center; gap:50px; flex-wrap:wrap; margin-bottom:50px; }
.lp .count-box { text-align:center; }
.lp .count-box strong { display:block; font-family:'Poppins'; font-size:clamp(2.4rem,6vw,3.4rem); font-weight:800; background:linear-gradient(120deg,#2563EB,#1E3A8A); -webkit-background-clip:text; background-clip:text; color:transparent; }
.lp .count-box span { color:var(--text-muted); font-weight:500; }
.lp .cat-grid { display:flex; flex-wrap:wrap; justify-content:center; gap:14px; max-width:900px; margin:0 auto; }
.lp .cat { display:flex; align-items:center; gap:9px; padding:13px 22px; border-radius:999px; background:#fff; border:1px solid rgba(37,99,235,.16); font-weight:600; color:var(--blue-800); transition:transform .25s,background .25s,color .25s; }
.lp .cat:hover { transform:translateY(-4px) scale(1.04); background:var(--gradient-primary); color:#fff; border-color:transparent; }

.lp .testimonials { padding:100px 0; background:#fff; }
.lp .ttrack { display:flex; gap:22px; overflow-x:auto; scroll-snap-type:x mandatory; padding:8px 4px 26px; scroll-behavior:smooth; scrollbar-width:none; }
.lp .ttrack::-webkit-scrollbar { display:none; }
.lp .tcard { scroll-snap-align:start; flex:0 0 340px; max-width:340px; background:#fff; border-radius:var(--radius); border:1px solid rgba(37,99,235,.1); padding:26px; box-shadow:0 10px 30px -18px rgba(10,22,40,.3); }
.lp .stars { color:#fbbf24; font-size:1rem; margin-bottom:12px; letter-spacing:2px; }
.lp .tcard p { color:#2b3a55; font-size:.96rem; margin:0 0 18px; }
.lp .treviewer { display:flex; align-items:center; gap:12px; }
.lp .tavatar { width:44px; height:44px; border-radius:50%; display:grid; place-items:center; font-weight:700; color:#fff; background:var(--gradient-primary); }
.lp .treviewer .tn { font-weight:700; font-size:.95rem; } .lp .treviewer .tc { color:var(--text-muted); font-size:.82rem; }
.lp .tnav { display:flex; justify-content:center; gap:12px; margin-top:6px; }
.lp .tnav button { width:46px; height:46px; border-radius:50%; border:1px solid rgba(37,99,235,.25); background:#fff; cursor:pointer; font-size:1.2rem; color:var(--blue-800); transition:all .2s; }
.lp .tnav button:hover { background:var(--gradient-primary); color:#fff; border-color:transparent; }

.lp .faq { padding:100px 0; background:var(--bg-soft); }
.lp .faq-list { max-width:820px; margin:0 auto; display:flex; flex-direction:column; gap:12px; }
.lp .faq-item { border:1px solid rgba(37,99,235,.14); border-radius:var(--radius-sm); overflow:hidden; background:#fff; transition:border-color .25s; }
.lp .faq-item.open { border-color:var(--blue-600); }
.lp .faq-q { width:100%; text-align:left; background:none; border:none; cursor:pointer; padding:18px 22px; font-size:1rem; font-weight:600; color:var(--text); display:flex; justify-content:space-between; align-items:center; gap:16px; font-family:'Inter'; }
.lp .faq-q .pm { flex-shrink:0; width:26px; height:26px; border-radius:50%; display:grid; place-items:center; background:rgba(37,99,235,.12); color:var(--blue-600); font-size:1.2rem; transition:transform .3s,background .3s,color .3s; }
.lp .faq-item.open .pm { transform:rotate(45deg); background:var(--gradient-primary); color:#fff; }
.lp .faq-a { max-height:0; overflow:hidden; transition:max-height .35s ease; }
.lp .faq-a p { padding:0 22px 20px; color:var(--text-muted); font-size:.95rem; margin:0; }

.lp .payment { padding:100px 0; background:#fff; }
.lp .pay-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:24px; max-width:960px; margin:0 auto; }
.lp .pay-card { background:var(--bg-soft); border-radius:var(--radius); padding:36px 32px; border:1px solid rgba(37,99,235,.12); transition:transform .3s,box-shadow .3s; }
.lp .pay-card:hover { transform:translateY(-6px); box-shadow:var(--shadow); }
.lp .pay-card .badge { display:inline-flex; align-items:center; gap:8px; font-size:.78rem; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:6px 13px; border-radius:999px; margin-bottom:16px; }
.lp .badge-instant { background:rgba(16,185,129,.14); color:#059669; }
.lp .badge-manual { background:rgba(37,99,235,.12); color:var(--blue-600); }
.lp .pay-card h3 { font-size:1.4rem; margin:0 0 8px; }
.lp .pay-card p { color:var(--text-muted); margin:0 0 20px; font-size:.96rem; }
.lp .pay-methods { display:flex; flex-wrap:wrap; gap:10px; }
.lp .pay-pill { display:flex; align-items:center; gap:8px; padding:10px 16px; border-radius:12px; background:#fff; border:1px solid rgba(37,99,235,.12); font-weight:600; font-size:.9rem; }

.lp .footer { background:var(--blue-950); color:#9fb3d6; padding:70px 0 30px; }
.lp .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:40px; margin-bottom:46px; }
.lp .footer .logo { color:#fff; margin-bottom:16px; }
.lp .footer p.about { max-width:360px; font-size:.95rem; margin:0; }
.lp .footer h4 { color:#fff; font-size:1rem; margin:0 0 16px; font-family:'Poppins'; }
.lp .footer-links { display:flex; flex-direction:column; gap:11px; }
.lp .footer-links a { font-size:.93rem; transition:color .2s; }
.lp .footer-links a:hover { color:var(--blue-400); }
.lp .footer-bottom { border-top:1px solid rgba(255,255,255,.1); padding-top:24px; text-align:center; font-size:.88rem; }

/* Trust strip */
.lp .trust-strip { background:var(--bg-soft); border-top:1px solid rgba(37,99,235,.08); border-bottom:1px solid rgba(37,99,235,.08); }
.lp .trust-row { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; padding:24px 22px; }
.lp .trust-row span { display:inline-flex; align-items:center; gap:8px; background:#fff; border:1px solid rgba(37,99,235,.18); border-radius:999px; padding:10px 18px; color:var(--blue-950); font-weight:600; font-size:.9rem; box-shadow:0 8px 20px -10px rgba(10,22,40,.28); transition:transform .2s, box-shadow .2s; }
.lp .trust-row span:hover { transform:translateY(-2px); box-shadow:0 10px 22px -10px rgba(37,99,235,.4); }

/* Benefits */
.lp .benefits-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
.lp .benefit { background:#fff; border:1px solid rgba(37,99,235,.14); border-left:4px solid var(--blue-600); border-radius:var(--radius-sm); padding:26px 22px; box-shadow:0 14px 34px -20px rgba(10,22,40,.30); transition:transform .3s, box-shadow .3s; }
.lp .benefit:hover { transform:translateY(-6px); box-shadow:0 22px 48px -22px rgba(10,22,40,.34); }
.lp .benefit h3 { font-size:1.1rem; margin:0 0 8px; }
.lp .benefit p { color:var(--text-muted); font-size:.95rem; margin:0; }

/* Comparison table */
.lp .cmp-wrap { max-width:920px; margin:0 auto; overflow-x:auto; border:1px solid rgba(37,99,235,.14); border-radius:var(--radius); }
.lp .cmp { width:100%; border-collapse:collapse; min-width:560px; }
.lp .cmp th, .lp .cmp td { padding:14px 16px; text-align:left; border-bottom:1px solid rgba(37,99,235,.1); font-size:.95rem; }
.lp .cmp thead th { background:var(--bg-soft); font-weight:700; }
.lp .cmp tbody tr:last-child td { border-bottom:none; }
.lp .cmp .cmp-us { background:rgba(37,99,235,.06); color:var(--blue-800); font-weight:700; }

@media (max-width:980px){ .lp .benefits-grid{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:640px){ .lp .benefits-grid{ grid-template-columns:1fr; } }

.lp .reveal { opacity:0; transform:translateY(40px); transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1); }
.lp .reveal.visible { opacity:1; transform:translateY(0); }
.lp .reveal.d1{transition-delay:.08s;} .lp .reveal.d2{transition-delay:.16s;} .lp .reveal.d3{transition-delay:.24s;} .lp .reveal.d4{transition-delay:.32s;}

@media (max-width:980px){
  .lp .hero-grid{grid-template-columns:1fr; text-align:center;}
  .lp .hero p.lead{margin-left:auto; margin-right:auto;}
  .lp .hero-ctas,.lp .hero-stats{justify-content:center;}
  .lp .hero-visual{order:-1; margin-bottom:10px;}
  .lp .features-grid{grid-template-columns:repeat(2,1fr);}
  .lp .steps{grid-template-columns:1fr;}
  .lp .device-grid{grid-template-columns:repeat(3,1fr);}
  .lp .plans{grid-template-columns:repeat(2,1fr);}
  .lp .pl-grid{grid-template-columns:repeat(2,1fr);}
  .lp .footer-grid{grid-template-columns:1fr 1fr;}
  .lp .footer .about-col{grid-column:1 / -1;}
}
@media (max-width:640px){
  .lp .nav-links{display:none;} .lp .nav-cta .btn-outline{display:none;}
  .lp .hamburger{display:flex;}
  .lp .logo-img{ height:58px; }
  .lp .features-grid{grid-template-columns:1fr;}
  .lp .device-grid{grid-template-columns:repeat(2,1fr);}
  .lp .plans{grid-template-columns:1fr;}
  .lp .pl-grid{grid-template-columns:1fr;}
  .lp .pay-grid{grid-template-columns:1fr;}
  .lp .footer-grid{grid-template-columns:1fr;}
}
`;
