import { useEffect, useState } from "react";

/* Holding content shown at /world-cup while the campaign is pending.
   This page is intentionally a neutral, informational article about
   Artificial Intelligence only — no brand, product, or service wording.
   When ready, flip WORLD_CUP_PAGE_ENABLED in App.tsx to restore the
   original landing page. */

const AI_TOPICS = [
  { ic: "🧠", t: "Machine Learning", d: "Instead of following fixed rules, these systems learn patterns from examples and improve as they see more data." },
  { ic: "💬", t: "Natural Language", d: "Models can read, understand and generate human language, which is what powers chat assistants and translation." },
  { ic: "👁", t: "Computer Vision", d: "AI can interpret images and video — recognising objects, reading text and spotting details people might miss." },
  { ic: "⚙️", t: "Automation", d: "Routine, repetitive tasks can be handled automatically, freeing people to focus on more creative work." },
  { ic: "🎯", t: "Personalization", d: "By learning preferences over time, AI can tailor what it shows to each person rather than a one-size-fits-all view." },
  { ic: "🔮", t: "Predictive Insights", d: "Drawing on historical data, models can estimate likely outcomes and help people plan ahead with more confidence." },
];

export default function WorldCupHolding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="ai">
      <style>{css}</style>

      {/* NAVBAR */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-inner">
          <span className="wordmark">AI <span>Insights</span></span>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <span className="eyebrow">🤖 Artificial Intelligence</span>
          <h1>Understanding AI and How It <span className="grad">Shapes Our World</span></h1>
          <p className="lead">
            Artificial intelligence is changing how we work, learn and make decisions. This short
            guide explains the main ideas behind AI in plain language — what it is, how it learns,
            and where it shows up in everyday life.
          </p>
        </div>
      </section>

      {/* TOPICS */}
      <section className="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">The Building Blocks</span>
            <h2>Key Ideas Behind AI</h2>
            <p>A few core concepts explain most of what modern AI can do today.</p>
          </div>
          <div className="features-grid">
            {AI_TOPICS.map((f, i) => (
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
          <h2>The Role of AI in Everyday Life</h2>
          <p>
            Artificial intelligence has quietly become part of daily routines. It suggests routes
            on a map, filters spam from inboxes, recognises faces in photos and answers questions in
            plain conversation. Most of the time it works in the background, making small decisions
            that add up to a smoother experience.
          </p>
          <h3>Learning from data</h3>
          <p>
            At its heart, AI learns from examples. Show a model thousands of labelled pictures of
            cats and dogs, and it gradually learns the features that tell them apart. The same idea
            applies to language, sound and many other kinds of information. The more varied and
            accurate the data, the better the results tend to be.
          </p>
          <h3>Assistants that understand you</h3>
          <p>
            Conversational AI can interpret a question, work out what is really being asked, and
            respond in clear language. This is why digital assistants feel more natural than the
            rigid menus of the past — they adapt to how people actually speak and write.
          </p>
          <h3>Using AI responsibly</h3>
          <p>
            As these tools grow more capable, fairness, accuracy and privacy matter more than ever.
            Good AI systems are tested carefully, explain their limits, and keep people in control of
            important decisions rather than replacing human judgement.
          </p>
          <p className="muted">
            This page is being updated. Please check back soon for more.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <span className="wordmark"><span>AI Insights</span></span>
          <p className="about">A plain-language introduction to artificial intelligence and the ideas that power it.</p>
          <div className="footer-bottom">© {new Date().getFullYear()} AI Insights. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

/* ============================ SCOPED STYLES ============================ */
const css = `
.ai { --ink:#0A1628; --ink-2:#1E3A8A; --accent:#2563EB; --accent-2:#60A5FA;
  --text:#0A1628; --text-muted:#5b6b85; --bg:#ffffff; --bg-soft:#f4f7fe;
  --radius:18px; --shadow:0 20px 50px -20px rgba(10,22,40,.30); --shadow-glow:0 12px 40px -8px rgba(37,99,235,.45);
  --gradient:linear-gradient(135deg,#2563EB 0%,#1E3A8A 100%); --nav-h:78px;
  font-family:'Inter',system-ui,sans-serif; color:var(--text); background:var(--bg); line-height:1.6; }
.ai * { box-sizing:border-box; }
.ai h1,.ai h2,.ai h3 { font-family:'Poppins','Inter',sans-serif; line-height:1.15; }
.ai .container { width:100%; max-width:1100px; margin:0 auto; padding:0 22px; }

.ai .wordmark { font-family:'Poppins','Inter',sans-serif; font-weight:800; font-size:1.4rem; color:var(--ink); letter-spacing:-.3px; }
.ai .wordmark span { background:linear-gradient(120deg,#2563EB,#1E3A8A); -webkit-background-clip:text; background-clip:text; color:transparent; }

.ai .eyebrow { display:inline-flex; align-items:center; gap:8px; font-size:.8rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); background:rgba(37,99,235,.1); padding:7px 14px; border-radius:999px; margin-bottom:18px; }
.ai .section-head { max-width:680px; margin:0 auto 48px; text-align:center; }
.ai .section-head h2 { font-size:clamp(1.8rem,4vw,2.6rem); font-weight:800; margin:0 0 12px; }
.ai .section-head p { color:var(--text-muted); font-size:1.05rem; margin:0; }

.ai .navbar { position:fixed; top:0; left:0; right:0; z-index:1000; height:var(--nav-h); display:flex; align-items:center; transition:background .35s,box-shadow .35s; background:transparent; }
.ai .navbar.scrolled { background:rgba(255,255,255,.92); backdrop-filter:blur(14px); box-shadow:0 6px 30px -14px rgba(10,22,40,.25); }
.ai .nav-inner { display:flex; align-items:center; justify-content:space-between; width:100%; }

.ai .hero { padding:calc(var(--nav-h) + 80px) 0 80px; text-align:center;
  background:radial-gradient(1000px 480px at 80% -10%,rgba(37,99,235,.14),transparent 60%),radial-gradient(700px 360px at 0% 10%,rgba(96,165,250,.16),transparent 55%),linear-gradient(180deg,#ffffff 0%,#f4f7fe 100%); }
.ai .hero-inner { max-width:800px; margin:0 auto; }
.ai .hero h1 { font-size:clamp(2.2rem,5vw,3.6rem); font-weight:800; letter-spacing:-.5px; margin:0; }
.ai .hero h1 .grad { background:linear-gradient(120deg,#2563EB,#1E3A8A); -webkit-background-clip:text; background-clip:text; color:transparent; }
.ai .hero p.lead { margin:22px auto 0; font-size:1.15rem; color:var(--text-muted); max-width:640px; }

.ai .features { padding:90px 0; background:#fff; }
.ai .features-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
.ai .feature-card { background:#fff; border:1px solid rgba(37,99,235,.12); border-radius:var(--radius); padding:30px 26px; box-shadow:0 12px 32px -22px rgba(10,22,40,.28); transition:transform .3s,box-shadow .3s,border-color .3s; }
.ai .feature-card:hover { transform:translateY(-8px); box-shadow:var(--shadow); border-color:rgba(37,99,235,.4); }
.ai .feature-ic { width:56px; height:56px; border-radius:16px; display:grid; place-items:center; font-size:1.6rem; background:var(--gradient); color:#fff; box-shadow:var(--shadow-glow); margin-bottom:16px; }
.ai .feature-card h3 { font-size:1.18rem; font-weight:700; margin:0 0 8px; }
.ai .feature-card p { color:var(--text-muted); font-size:.96rem; margin:0; }

.ai .article { padding:90px 0; background:var(--bg-soft); }
.ai .article-inner { max-width:780px; margin:0 auto; }
.ai .article-inner h2 { font-size:clamp(1.7rem,3.6vw,2.4rem); font-weight:800; margin:0 0 18px; }
.ai .article-inner h3 { font-size:1.25rem; font-weight:700; margin:30px 0 8px; }
.ai .article-inner p { color:#33415c; font-size:1.02rem; margin:0 0 16px; }
.ai .article-inner p.muted { color:var(--text-muted); }

.ai .footer { background:var(--ink); color:#9fb3d6; padding:56px 0 30px; text-align:center; }
.ai .footer .wordmark { color:#fff; display:inline-block; margin-bottom:14px; }
.ai .footer p.about { max-width:560px; margin:0 auto 22px; font-size:.95rem; }
.ai .footer-bottom { border-top:1px solid rgba(255,255,255,.1); padding-top:22px; font-size:.88rem; }

@media (max-width:980px){ .ai .features-grid{ grid-template-columns:repeat(2,1fr); } }
@media (max-width:640px){ .ai .features-grid{ grid-template-columns:1fr; } }
`;
