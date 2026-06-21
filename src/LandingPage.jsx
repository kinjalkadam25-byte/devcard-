import { ContainerScroll } from "@/components/ui/container-scroll-animation"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

// Reusable scroll-triggered fade-up
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0 } }
const vp = { once: true, margin: "-80px" }

function FadeUp({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={vp}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── Kanban mockup rendered inside ContainerScroll ───────────────────────────

function ProductMockup() {
  return (
    <div className="w-full h-full flex bg-[#F8F7FF] rounded-2xl overflow-hidden font-sans text-sm">
      {/* Sidebar */}
      <div className="w-44 bg-white border-r border-indigo-100 p-4 flex flex-col gap-1 shrink-0">
        <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest mb-2 px-2">Workspace</p>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="4" height="4" rx="0.8" fill="currentColor"/><rect x="7" y="1" width="4" height="4" rx="0.8" fill="currentColor" opacity=".5"/><rect x="1" y="7" width="4" height="4" rx="0.8" fill="currentColor" opacity=".5"/><rect x="7" y="7" width="4" height="4" rx="0.8" fill="currentColor" opacity=".3"/></svg>
          Dashboard
        </div>
        {["Sprints", "Board", "Docs", "Settings"].map(item => (
          <div key={item} className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:bg-indigo-50 cursor-pointer">{item}</div>
        ))}
        <div className="mt-auto pt-3 border-t border-indigo-50">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[9px] font-bold">J</div>
            <span className="text-[10px] text-slate-400">Jane Cooper</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-5 overflow-hidden">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-semibold text-slate-800 text-sm">Q3 Sprint — Week 4</p>
            <p className="text-[10px] text-slate-400 mt-0.5">14 tasks · 6 done · 3 in review</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {["#6366F1","#ec4899","#f59e0b"].map((c,i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold" style={{ background: c }}>
                  {["J","M","R"][i]}
                </div>
              ))}
            </div>
            <div className="bg-emerald-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer">+ Add task</div>
          </div>
        </div>

        {/* Kanban columns */}
        <div className="grid grid-cols-3 gap-3 h-[calc(100%-56px)]">
          {/* To Do */}
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">To do</span>
              <span className="text-[10px] bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-400">5</span>
            </div>
            <div className="space-y-2">
              {["API rate limiting","Write onboarding docs","Dark mode polish"].map(t => (
                <div key={t} className="bg-white border border-slate-100 rounded-lg p-2 text-[11px] text-slate-700 shadow-sm">{t}</div>
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-indigo-50/60 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wide">In progress</span>
              <span className="text-[10px] bg-indigo-100 border border-indigo-200 rounded-full px-2 py-0.5 text-indigo-500">3</span>
            </div>
            <div className="space-y-2">
              {["Auth OTP flow","Dashboard redesign"].map(t => (
                <div key={t} className="bg-white border border-indigo-200 rounded-lg p-2 text-[11px] text-slate-700 shadow-sm">{t}</div>
              ))}
              <div className="bg-indigo-600 rounded-lg p-2 text-[11px] text-white shadow-sm">AI sprint planning ✦</div>
            </div>
          </div>

          {/* Done */}
          <div className="bg-emerald-50/60 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide">Done</span>
              <span className="text-[10px] bg-emerald-100 border border-emerald-200 rounded-full px-2 py-0.5 text-emerald-600">6</span>
            </div>
            <div className="space-y-2">
              {["Mobile navigation","Invite team flow","CI pipeline setup"].map(t => (
                <div key={t} className="bg-white border border-slate-100 rounded-lg p-2 text-[11px] text-slate-400 line-through shadow-sm">{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── section components ───────────────────────────────────────────────────────

function Navbar({ onGetStarted }) {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-indigo-100">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h4l2-4 2 8 2-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">Flowly</span>
        </div>

        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          {["Features","How it works","Pricing"].map(l => (
            <li key={l}><a href={`#${l.toLowerCase().replace(/\s+/g,"-")}`} className="hover:text-slate-900 transition-colors duration-150">{l}</a></li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href="#" className="hidden sm:inline text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-150">Log in</a>
          <button onClick={onGetStarted} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors duration-150 flex items-center gap-1.5">
            Get started free
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5h8M6.5 2.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </nav>
    </header>
  )
}

function Features() {
  const items = [
    { icon: "📋", color: "bg-indigo-100 text-indigo-600", title: "Smart sprint planning", desc: "AI reads your backlog and suggests realistic sprint goals — no more overloaded weeks." },
    { icon: "⚡", color: "bg-emerald-100 text-emerald-600", title: "Real-time progress", desc: "Live velocity and burndown charts update as your team moves tasks. No manual syncing." },
    { icon: "🔗", color: "bg-violet-100 text-violet-600", title: "GitHub integration", desc: "PRs auto-link to tasks. Merge a branch and the card moves itself." },
    { icon: "👥", color: "bg-amber-100 text-amber-600", title: "Team workload view", desc: "See who's overloaded instantly. Rebalance with drag-and-drop before deadlines slip." },
    { icon: "🤖", color: "bg-rose-100 text-rose-600", title: "Automated standups", desc: "Flowly compiles your daily standup from task activity so you can skip the 9am call." },
    { icon: "📱", color: "bg-sky-100 text-sky-600", title: "Works everywhere", desc: "Fully responsive web app and native iOS & Android — your workflow goes with your team." },
  ]

  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-24">
      <FadeUp className="text-center mb-16">
        <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">Everything you need</p>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Built for how teams<br/>actually work</h2>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">No more switching between five tools. Flowly keeps planning, code, and conversations in one place.</p>
      </FadeUp>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map(({ icon, color, title, desc }, i) => (
          <FadeUp key={title} delay={i * 0.07}>
            <div className="h-full bg-white border-2 border-slate-100 hover:border-indigo-300 rounded-2xl p-6 transition-colors duration-200 cursor-default">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl mb-4`}>{icon}</div>
              <h3 className="font-semibold text-slate-900 text-base mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: "1", color: "bg-indigo-600", title: "Create your workspace", desc: "Sign up, name your team, invite members via email or link. Takes 30 seconds." },
    { n: "2", color: "bg-indigo-600", title: "Import or start fresh", desc: "Import from Jira, Linear, or Notion in one click — or start a new project from scratch." },
    { n: "3", color: "bg-emerald-500", title: "Ship with your team", desc: "Plan your first sprint, connect GitHub, and let Flowly keep everyone aligned automatically." },
  ]

  return (
    <section id="how-it-works" className="bg-white border-y border-slate-100 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">Simple by design</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Up and running<br/>in 3 minutes</h2>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map(({ n, color, title, desc }, i) => (
            <FadeUp key={n} delay={i * 0.1} className="text-center">
              <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white font-bold text-xl mx-auto mb-5`}>{n}</div>
              <h3 className="font-semibold text-slate-900 text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stats() {
  const data = [["4k+","Teams shipping"],["2.4M","Tasks completed"],["37%","Faster sprints"],["99.9%","Uptime SLA"]]
  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {data.map(([n, l], i) => (
          <FadeUp key={l} delay={i * 0.08} className="text-center">
            <p className="text-4xl font-bold text-indigo-600 mb-1">{n}</p>
            <p className="text-slate-500 text-sm">{l}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

function Pricing({ onGetStarted }) {
  const plans = [
    {
      name: "Starter", price: "$0", desc: "Free forever for small teams",
      cta: "Get started", ctaStyle: "border-2 border-slate-200 hover:border-indigo-400 text-slate-800",
      features: ["Up to 5 members","3 active projects","Basic board & sprints","GitHub integration"],
      highlight: false,
    },
    {
      name: "Pro", price: "$12", unit: "/seat/mo", desc: "Everything your team needs",
      cta: "Start free trial", ctaStyle: "bg-white hover:bg-indigo-50 text-indigo-600 font-semibold",
      features: ["Unlimited members","Unlimited projects","AI sprint planning","Automated standups","Priority support"],
      highlight: true,
    },
    {
      name: "Enterprise", price: "Custom", desc: "For orgs that need more control",
      cta: "Talk to sales", ctaStyle: "border-2 border-slate-200 hover:border-indigo-400 text-slate-800",
      features: ["Everything in Pro","SSO & SAML","Audit logs","Dedicated SLA"],
      highlight: false,
    },
  ]

  return (
    <section id="pricing" className="bg-white border-y border-slate-100 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">Simple, transparent pricing</h2>
          <p className="text-slate-500">No surprise fees. Cancel anytime.</p>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {plans.map(({ name, price, unit, desc, cta, ctaStyle, features, highlight }, i) => (
            <FadeUp key={name} delay={i * 0.08}>
            <div className={`rounded-2xl p-7 relative transition-transform duration-200 hover:-translate-y-1 ${highlight ? "bg-indigo-600 border-2 border-indigo-600" : "bg-[#F8F7FF] border-2 border-slate-100"}`}>
              {highlight && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full">Most popular</div>}
              <p className={`text-xs font-semibold uppercase tracking-widest mb-1 ${highlight ? "text-indigo-200" : "text-slate-500"}`}>{name}</p>
              <div className="flex items-end gap-1 mb-1">
                <span className={`text-4xl font-bold ${highlight ? "text-white" : "text-slate-900"}`}>{price}</span>
                {unit && <span className={`text-sm mb-1.5 ${highlight ? "text-indigo-200" : "text-slate-400"}`}>{unit}</span>}
              </div>
              <p className={`text-sm mb-5 ${highlight ? "text-indigo-200" : "text-slate-500"}`}>{desc}</p>
              <button onClick={onGetStarted} className={`w-full py-2.5 rounded-xl text-sm transition-colors duration-150 cursor-pointer ${ctaStyle}`}>{cta}</button>
              <ul className="mt-5 space-y-2.5">
                {features.map(f => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${highlight ? "text-indigo-100" : "text-slate-600"}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke={highlight ? "white" : "#10B981"} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCTA({ onGetStarted }) {
  return (
    <section className="max-w-3xl mx-auto px-6 py-24 text-center">
      <FadeUp>
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Ready to ship faster?</h2>
        <p className="text-slate-500 text-lg mb-10">Join 4,000+ teams that run their entire engineering workflow in Flowly.</p>
        <button onClick={onGetStarted} className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors duration-150 inline-flex items-center gap-2 cursor-pointer">
          Get started — it's free
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </FadeUp>
    </section>
  )
}

function Footer() {
  const cols = [
    { heading: "Product", links: ["Features","Pricing","Changelog","Roadmap"] },
    { heading: "Company", links: ["About","Blog","Careers","Contact"] },
    { heading: "Legal", links: ["Privacy","Terms","Security"] },
  ]

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 7h4l2-4 2 8 2-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className="font-bold text-slate-900">Flowly</span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">Project management for teams that ship. Fast, focused, built for developers.</p>
          </div>
          <div className="grid grid-cols-3 gap-8 text-sm">
            {cols.map(({ heading, links }) => (
              <div key={heading}>
                <p className="font-semibold text-slate-900 mb-3">{heading}</p>
                <ul className="space-y-2">
                  {links.map(l => <li key={l}><a href="#" className="text-slate-500 hover:text-slate-900 transition-colors duration-150">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-400">© 2026 Flowly, Inc. All rights reserved.</p>
          <p className="text-xs text-slate-400">Made with ♥ for builders</p>
        </div>
      </div>
    </footer>
  )
}

// ─── main export ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate()
  const goToApp = () => navigate("/app")

  return (
    <div className="min-h-screen bg-[#F8F7FF] text-slate-900 font-sans antialiased">
      <Navbar onGetStarted={goToApp} />

      <main>
        {/* Hero with ContainerScroll */}
        <section className="bg-[#F8F7FF]">
          <ContainerScroll
            titleComponent={
              <div className="flex flex-col items-center">
                <div className="inline-flex items-center gap-2 bg-white border border-indigo-200 rounded-full px-4 py-1.5 text-xs font-medium text-indigo-600 mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  New: AI-powered sprint planning is here
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-[5.5rem] font-bold text-slate-900 leading-tight tracking-tight mb-6">
                  Ship faster,<br />
                  <span className="text-indigo-600">together.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
                  Flowly brings your team's tasks, docs, and sprints into one calm workspace — so you spend less time managing and more time building.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                  <button onClick={goToApp} className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer">
                    Start for free — no credit card
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 7.5h9M7.5 3l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                  <button className="w-full sm:w-auto bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 font-medium px-7 py-3.5 rounded-xl text-base transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="#6366F1" strokeWidth="1.5"/><path d="M6.5 5.5l4 2.5-4 2.5V5.5z" fill="#6366F1"/></svg>
                    Watch 2-min demo
                  </button>
                </div>
                <p className="text-xs text-slate-400">Trusted by 4,000+ engineering teams</p>
              </div>
            }
          >
            <ProductMockup />
          </ContainerScroll>
        </section>

        {/* Social proof */}
        <section className="border-y border-slate-100 bg-white py-10">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <FadeUp>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-7">Trusted by teams at</p>
              <div className="flex flex-wrap items-center justify-center gap-10">
                {["Linear","Vercel","Raycast","Loom","Arc","Pitch"].map((name, i) => (
                  <motion.span
                    key={name}
                    className="text-xl font-bold text-slate-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={vp}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    {name}
                  </motion.span>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        <Features />
        <HowItWorks />
        <Stats />
        <Pricing onGetStarted={goToApp} />
        <FinalCTA onGetStarted={goToApp} />
      </main>

      <Footer />
    </div>
  )
}
