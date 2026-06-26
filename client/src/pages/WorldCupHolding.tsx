import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicAIChatWidget from "@/components/PublicAIChatWidget";

const LOGO_URL = "https://pub-5b34ab7e74be4b678343a2ff1c41d64c.r2.dev/iptvtop%20live%20logo.png";

/* Holding content shown at /world-cup while the ad campaign is pending approval.
   It presents real, useful content about AI in streaming and our AI live agent,
   so the URL always resolves to a genuine page (no redirect / cloaking). When
   ads are approved, flip WORLD_CUP_PAGE_ENABLED in App.tsx to restore the
   full World Cup landing page. */

const AI_FEATURES = [
  { ic: "💬", t: "24/7 AI Live Agent", d: "Our AI-powered assistant answers questions about plans, devices, setup and payments instantly — any hour of the day." },
  { ic: "🧠", t: "Smart Recommendations", d: "AI helps match you to the right plan and number of connections based on how and where you like to watch." },
  { ic: "⚡", t: "Faster Support", d: "Common questions are resolved in seconds, and anything complex is handed to our human team with full context." },
  { ic: "🛡", t: "Reliable & Private", d: "The assistant focuses on helping you choose and set up your service. Your conversations stay tied to your support session." },
  { ic: "🌍", t: "Replies in Your Language", d: "Ask in the language you're comfortable with and the assistant responds in kind, so nothing gets lost in translation." },
  { ic: "📱", t: "Setup Guidance", d: "Step-by-step help installing apps and entering your details on Smart TV, Firestick, Android, iPhone and more." },
];

export default function WorldCupHolding() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <div className="wch">
      <style>{css}</style>

      {/* NAVBAR */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <Link href="/" className="logo"><img src={LOGO_URL} alt="IPTV TOP" className="logo-img" /></Link>
          <div className="nav-cta">
            <Link href="/" className="btn btn-outline">Home</Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn btn-primary">Dashboard</Link>
            ) : (
              <Link href="/login" className="btn btn-primary">Login</Link>
            )}
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">🤖 Powered by AI</span>
          <h1>Smarter Streaming, Backed by <span className="grad">AI</span></h1>
          <p className="lead">
            At IPTV TOP, artificial intelligence helps you find the right plan, set up your
            devices and get answers the moment you need them. Here's how AI makes a premium
            streaming experience simpler and faster for everyone.
          </p>
          <div className="hero-ctas">
            <Link href={primaryHref} className="btn btn-primary btn-lg">Get Started</Link>
            <Link href="/" className="btn btn-outline btn-lg">Explore IPTV TOP</Link>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">What AI Does Here</span>
            <h2>How AI Helps You Watch</h2>
            <p>From the first question to your first stream, AI is there to make things easier.</p>
          </div>
          <div className="features-grid">
            {AI_FEATURES.map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-ic">{f.ic}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLE */}
      <section className="article">
        <div className="container article-inner">
          <h2>The Role of AI in Modern Streaming</h2>
          <p>
            Artificial intelligence has quietly become part of how we watch television. Behind the
            scenes, AI helps deliver smoother streams, smarter search and friendlier support. For a
            service with tens of thousands of channels and a huge on-demand library, that kind of
            help matters — it turns a long list of options into something you can actually navigate.
          </p>
          <h3>Instant, around-the-clock help</h3>
          <p>
            The most visible way we use AI is our live agent. Instead of waiting for office hours,
            you can ask a question at any time and get a clear answer right away. The assistant
            understands questions about plans, supported devices, payments and setup, and it points
            you to the next step. When something needs a human touch, it hands the conversation to
            our support team with the details already gathered, so you don't have to repeat yourself.
          </p>
          <h3>Recommendations that fit how you watch</h3>
          <p>
            Everyone watches differently. Some households need several connections for different
            rooms; others just want one screen in 4K. AI helps weigh those needs and suggest a
            sensible plan, so you're not guessing or paying for more than you'll use.
          </p>
          <h3>Reliability you don't have to think about</h3>
          <p>
            Smart load balancing and monitoring help keep streams steady during peak times, like big
            match nights or popular premieres. The goal is simple: you press play, and it just works.
          </p>
          <p className="muted">
            We're putting the finishing touches on something special for sports fans. Check back soon,
            or <Link href="/" className="inline-link">visit our homepage</Link> to start with a free trial today.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="container cta-inner">
          <h2>Ready to start watching?</h2>
          <p>Try IPTV TOP free for 24 hours and see the difference for yourself.</p>
          <div className="cta-band-btns">
            <Link href={primaryHref} className="btn btn-light btn-lg">Start Free Trial</Link>
            <Link href="/" className="btn btn-ghost-light btn-lg">Back to Home</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <Link href="/" className="logo"><img src={LOGO_URL} alt="IPTV TOP" className="logo-img" /></Link>
          <p className="about">IPTV TOP is a premium IPTV service with 50,000+ live channels and 200,000+ movies and series, backed by AI-assisted support.</p>
          <div className="footer-bottom">© {new Date().getFullYear()} IPTV TOP — Premium IPTV Service. All rights reserved.</div>
        </div>
      </footer>

      <PublicAIChatWidget />
    </div>
  );
}

/* ============================ SCOPED STYLES ============================ */
const css = `
.wch { --blue-950:#0A1628; --blue-800:#1E3A8A; --blue-600:#2563EB; --blue-400:#60A5FA;
  --text:#0A1628; --text-muted:#5b6b85; --bg:#ffffff; --bg-soft:#f4f7fe;
  --radius:18px; --radius-sm:12px; --shadow:0 20px 50px -20px rgba(10,22,40,.30); --shadow-glow:0 12px 40px -8px rgba(37,99,235,.45);
  --gradient-primary:linear-gradient(135deg,#2563EB 0%,#1E3A8A 100%); --nav-h:104px;
  font-family:'Inter',system-ui,sans-serif; color:var(--text); background:var(--bg); line-height:1.6; }
.wch * { box-sizing:border-box; }
.wch h1,.wch h2,.wch h3 { font-family:'Poppins','Inter',sans-serif; line-height:1.15; }
.wch a { color:inherit; text-decoration:none; }
.wch .container { width:100%; max-width:1100px; margin:0 auto; padding:0 22px; }

.wch .eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:.8rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--blue-600); background:rgba(37,99,235,.1); padding:7px 14px; border-radius:999px; margin-bottom:18px; }
.wch .section-head { max-width:680px; margin:0 auto 48px; text-align:center; }
.wch .section-head h2 { font-size:clamp(1.8rem,4vw,2.6rem); font-weight:800; margin:0 0 12px; }
.wch .section-head p { color:var(--text-muted); font-size:1.05rem; margin:0; }

.wch .btn { display:inline-flex; align-items:center; justify-content:center; gap:9px; font-weight:700; font-size:1rem; padding:13px 24px; border-radius:999px; border:none; cursor:pointer; transition:transform .25s,box-shadow .25s,background .25s,color .25s; white-space:nowrap; }
.wch .btn-primary { background:var(--gradient-primary); color:#fff; box-shadow:0 8px 24px -8px rgba(37,99,235,.7); }
.wch .btn-primary:hover { transform:translateY(-3px); box-shadow:0 16px 38px -8px rgba(37,99,235,.95); }
.wch .btn-outline { background:#fff; color:var(--blue-800); border:1.5px solid rgba(37,99,235,.3); }
.wch .btn-outline:hover { transform:translateY(-3px); background:rgba(37,99,235,.06); }
.wch .btn-light { background:#fff; color:var(--blue-800); }
.wch .btn-light:hover { transform:translateY(-3px); box-shadow:0 16px 38px -10px rgba(0,0,0,.4); }
.wch .btn-ghost-light { background:rgba(255,255,255,.12); color:#fff; border:1.5px solid rgba(255,255,255,.55); }
.wch .btn-ghost-light:hover { transform:translateY(-3px); background:rgba(255,255,255,.22); }
.wch .btn-lg { padding:15px 30px; font-size:1.05rem; }

.wch .navbar { position:fixed; top:0; left:0; right:0; z-index:1000; height:var(--nav-h); display:flex; align-items:center; transition:background .35s,box-shadow .35s; background:transparent; }
.wch .navbar.scrolled { background:rgba(255,255,255,.92); backdrop-filter:blur(14px); box-shadow:0 6px 30px -14px rgba(10,22,40,.25); }
.wch .nav-inner { display:flex; align-items:center; justify-content:space-between; width:100%; }
.wch .logo { display:flex; align-items:center; }
.wch .logo-img { height:80px; width:auto; display:block; }
.wch .nav-cta { display:flex; align-items:center; gap:10px; }

.wch .hero { padding:calc(var(--nav-h) + 70px) 0 80px; text-align:center;
  background:radial-gradient(1000px 480px at 80% -10%,rgba(37,99,235,.14),transparent 60%),radial-gradient(700px 360px at 0% 10%,rgba(96,165,250,.16),transparent 55%),linear-gradient(180deg,#ffffff 0%,#f4f7fe 100%); }
.wch .hero-inner { max-width:780px; margin:0 auto; }
.wch .hero h1 { font-size:clamp(2.2rem,5vw,3.6rem); font-weight:800; letter-spacing:-.5px; margin:0; }
.wch .hero h1 .grad { background:linear-gradient(120deg,#2563EB,#1E3A8A); -webkit-background-clip:text; background-clip:text; color:transparent; }
.wch .hero p.lead { margin:22px auto 30px; font-size:1.15rem; color:var(--text-muted); max-width:620px; }
.wch .hero-ctas { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }

.wch .features { padding:90px 0; background:#fff; }
.wch .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
.wch .feature-card { background:#fff; border:1px solid rgba(37,99,235,.12); border-radius:var(--radius); padding:30px 26px; box-shadow:0 12px 32px -22px rgba(10,22,40,.28); transition:transform .3s,box-shadow .3s,border-color .3s; }
.wch .feature-card:hover { transform:translateY(-8px); box-shadow:var(--shadow); border-color:rgba(37,99,235,.4); }
.wch .feature-ic { width:56px; height:56px; border-radius:16px; display:grid; place-items:center; font-size:1.6rem; background:var(--gradient-primary); color:#fff; box-shadow:var(--shadow-glow); margin-bottom:16px; }
.wch .feature-card h3 { font-size:1.18rem; font-weight:700; margin:0 0 8px; }
.wch .feature-card p { color:var(--text-muted); font-size:.96rem; margin:0; }

.wch .article { padding:90px 0; background:var(--bg-soft); }
.wch .article-inner { max-width:780px; margin:0 auto; }
.wch .article-inner h2 { font-size:clamp(1.7rem,3.6vw,2.4rem); font-weight:800; margin:0 0 18px; }
.wch .article-inner h3 { font-size:1.25rem; font-weight:700; margin:30px 0 8px; }
.wch .article-inner p { color:#33415c; font-size:1.02rem; margin:0 0 16px; }
.wch .article-inner p.muted { color:var(--text-muted); }
.wch .inline-link { color:var(--blue-600); font-weight:600; text-decoration:underline; }

.wch .cta-band { padding:80px 0; background:var(--gradient-primary); color:#fff; }
.wch .cta-inner { text-align:center; max-width:620px; margin:0 auto; }
.wch .cta-inner h2 { font-size:clamp(1.7rem,4vw,2.4rem); font-weight:800; margin:0 0 12px; color:#fff; }
.wch .cta-inner p { color:rgba(255,255,255,.92); font-size:1.05rem; margin:0 0 24px; }
.wch .cta-band-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }

.wch .footer { background:var(--blue-950); color:#9fb3d6; padding:56px 0 30px; text-align:center; }
.wch .footer .logo { justify-content:center; margin-bottom:14px; }
.wch .footer .logo-img { height:64px; }
.wch .footer p.about { max-width:560px; margin:0 auto 22px; font-size:.95rem; }
.wch .footer-bottom { border-top:1px solid rgba(255,255,255,.1); padding-top:22px; font-size:.88rem; }

@media (max-width:980px){ .wch .features-grid{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:640px){
  .wch .features-grid{ grid-template-columns:1fr; }
  .wch .logo-img{ height:56px; }
}
`;
