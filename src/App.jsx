import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07070c; --accent: #FF6B35; --accent-soft: rgba(255,107,53,0.15);
    --text: #f2f0ff; --muted: #8b8799; --faint: #4a4757;
    --border: rgba(255,255,255,0.07); --border-hover: rgba(255,255,255,0.14);
    --glass: rgba(20,19,28,0.6);
  }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; -webkit-font-smoothing: antialiased; }

  .ambient {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
    background: radial-gradient(600px circle at 15% 20%, rgba(255,107,53,0.10), transparent 45%),
      radial-gradient(700px circle at 85% 75%, rgba(139,127,255,0.10), transparent 45%),
      linear-gradient(180deg, #07070c 0%, #0a0910 100%);
  }
  .grid-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 90%);
  }

  /* LOGIN */
  .login-wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
  .login-logo { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--accent); letter-spacing: 0.2em; margin-bottom: 0.75rem; }
  .login-title { font-size: 2.75rem; font-weight: 600; color: var(--text); letter-spacing: -0.04em; margin-bottom: 0.5rem; }
  .login-sub { font-size: 15px; color: var(--muted); margin-bottom: 2.5rem; font-weight: 300; }
  .glass-card { background: var(--glass); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04); }
  .login-card { padding: 2rem; width: 100%; max-width: 380px; display: flex; flex-direction: column; gap: 14px; }

  .input { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 12px; padding: 13px 16px; color: var(--text); font-size: 14px; font-family: 'Inter', sans-serif; outline: none; width: 100%; transition: border-color 0.2s, box-shadow 0.2s; }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .input::placeholder { color: var(--faint); }
  .textarea { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 12px; padding: 13px 16px; color: var(--text); font-size: 14px; font-family: 'Inter', sans-serif; outline: none; width: 100%; resize: none; height: 92px; line-height: 1.6; transition: border-color 0.2s, box-shadow 0.2s; }
  .textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .textarea::placeholder { color: var(--faint); }

  .btn-primary { background: var(--accent); color: #1a0d05; border: none; border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; box-shadow: 0 8px 24px rgba(255,107,53,0.25); transition: opacity 0.2s; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-ghost { background: rgba(255,255,255,0.03); color: var(--muted); border: 1px solid var(--border); border-radius: 12px; padding: 14px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; }
  .btn-ghost:hover { border-color: var(--border-hover); color: var(--text); background: rgba(255,255,255,0.06); }
  .btn-google { display: flex; align-items: center; justify-content: center; gap: 9px; background: rgba(255,255,255,0.04); color: var(--text); border: 1px solid var(--border); border-radius: 12px; padding: 13px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; width: 100%; }
  .btn-google:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.09); }
  .auth-divider { display: flex; align-items: center; gap: 12px; color: var(--faint); font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.12em; }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .otp-input { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 12px; padding: 18px 16px; color: var(--text); font-size: 26px; font-family: 'JetBrains Mono', monospace; outline: none; width: 100%; text-align: center; letter-spacing: 0.5em; transition: border-color 0.2s, box-shadow 0.2s; }
  .otp-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .otp-input::placeholder { letter-spacing: 0.35em; color: var(--faint); font-size: 20px; }
  .otp-hint { font-size: 12.5px; color: var(--muted); font-family: 'JetBrains Mono', monospace; text-align: center; line-height: 1.5; }
  .auth-row { display: flex; justify-content: space-between; align-items: center; }
  .text-btn { background: none; border: none; color: var(--faint); font-size: 12px; font-family: 'JetBrains Mono', monospace; cursor: pointer; padding: 0; transition: color 0.2s; }
  .text-btn:hover { color: var(--text); }
  .msg { font-size: 12.5px; color: var(--accent); font-family: 'JetBrains Mono', monospace; }

  /* TOPBAR */
  .topbar { position: sticky; top: 0; z-index: 20; display: flex; justify-content: space-between; align-items: center; padding: 16px 28px; background: rgba(10,9,16,0.7); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); }
  .editor-logo { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 600; color: var(--text); letter-spacing: -0.02em; }
  .editor-logo span { color: var(--accent); }
  .header-actions { display: flex; gap: 10px; }
  .btn-sm { padding: 8px 16px; border-radius: 10px; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; border: none; }
  .btn-sm-ghost { background: rgba(255,255,255,0.04); color: var(--muted); border: 1px solid var(--border) !important; }
  .btn-sm-ghost:hover { border-color: var(--border-hover) !important; color: var(--text); }
  .btn-sm-accent { background: var(--accent); color: #1a0d05; font-weight: 600; box-shadow: 0 4px 14px rgba(255,107,53,0.25); }

  /* DASHBOARD */
  .dashboard-wrap { position: relative; z-index: 1; min-height: 100vh; }
  .dashboard-content { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem; }
  .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
  .dashboard-title { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; }
  .dashboard-sub { font-size: 13px; color: var(--muted); margin-top: 4px; font-family: 'JetBrains Mono', monospace; }

  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; }

  .profile-tile {
    background: linear-gradient(165deg, rgba(28,26,38,0.85), rgba(15,14,22,0.9));
    border: 1px solid var(--border); border-radius: 18px; padding: 1.5rem;
    position: relative; overflow: hidden; cursor: pointer;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  }
  .profile-tile:hover { border-color: rgba(255,107,53,0.35); transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.4), 0 0 20px rgba(255,107,53,0.08); }
  .tile-glow { position: absolute; top: -1px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); }
  .tile-handle { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent); letter-spacing: 0.08em; margin-bottom: 6px; }
  .tile-name { font-size: 1.1rem; font-weight: 600; color: var(--text); letter-spacing: -0.02em; margin-bottom: 6px; }
  .tile-bio { font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .tile-skills { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 1rem; }
  .tile-skill { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 6px; padding: 3px 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #b5b1c7; }
  .tile-actions { display: flex; gap: 8px; }
  .tile-btn { flex: 1; padding: 9px; border-radius: 9px; font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace; transition: all 0.2s; text-align: center; }
  .tile-btn-edit { background: rgba(255,107,53,0.1); color: var(--accent); border: 1px solid rgba(255,107,53,0.2); }
  .tile-btn-edit:hover { background: rgba(255,107,53,0.18); border-color: var(--accent); }
  .tile-btn-view { background: rgba(255,255,255,0.04); color: var(--muted); border: 1px solid var(--border); }
  .tile-btn-view:hover { border-color: var(--border-hover); color: var(--text); }
  .tile-btn-delete { background: rgba(255,60,60,0.08); color: #ff6060; border: 1px solid rgba(255,60,60,0.15); padding: 9px 12px; border-radius: 9px; font-size: 12px; cursor: pointer; transition: all 0.2s; }
  .tile-btn-delete:hover { background: rgba(255,60,60,0.16); border-color: rgba(255,60,60,0.35); }

  .new-card-tile {
    border: 1px dashed rgba(255,255,255,0.12); border-radius: 18px; padding: 1.5rem;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; cursor: pointer; min-height: 200px;
    transition: border-color 0.2s, background 0.2s;
  }
  .new-card-tile:hover { border-color: var(--accent); background: rgba(255,107,53,0.04); }
  .new-card-icon { font-size: 28px; color: var(--faint); transition: color 0.2s; }
  .new-card-tile:hover .new-card-icon { color: var(--accent); }
  .new-card-label { font-size: 13px; color: var(--faint); font-family: 'JetBrains Mono', monospace; }
  .new-card-tile:hover .new-card-label { color: var(--accent); }

  /* EDITOR */
  .editor-wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }
  .editor-grid { display: grid; grid-template-columns: 1fr 1fr; flex: 1; min-height: calc(100vh - 60px); }
  @media (max-width: 860px) { .editor-grid { grid-template-columns: 1fr; } .preview-panel { display: none; } }
  .editor-panel { padding: 2rem 2.25rem 4rem; border-right: 1px solid var(--border); max-height: calc(100vh - 60px); overflow-y: auto; position: relative; }

  .section { margin-top: 2rem; }
  .section:first-of-type { margin-top: 0.5rem; }
  .section-head { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; }
  .section-icon { width: 26px; height: 26px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent); font-size: 13px; }
  .section-title { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; font-weight: 500; }
  .section-line { flex: 1; height: 1px; background: var(--border); }
  .field-group { display: flex; flex-direction: column; gap: 11px; }
  .save-btn { margin-top: 2rem; width: 100%; padding: 15px; background: var(--accent); color: #1a0d05; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.03em; box-shadow: 0 8px 28px rgba(255,107,53,0.22); }

  .preview-panel { padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; position: sticky; top: 60px; height: calc(100vh - 60px); }
  .preview-label { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--faint); letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 1.5rem; }

  /* CARD */
  .card-scene { perspective: 1400px; width: 100%; max-width: 380px; }
  .card-3d { position: relative; width: 100%; transform-style: preserve-3d; }
  .card-face { border-radius: 22px; padding: 2rem; background: linear-gradient(165deg, rgba(28,26,38,0.85), rgba(15,14,22,0.9)); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border); box-shadow: 0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05); position: relative; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .card-back { position: absolute; inset: 0; transform: rotateY(180deg); }
  .card-glow { position: absolute; top: -1px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); }
  .card-handle { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--accent); letter-spacing: 0.08em; margin-bottom: 0.75rem; }
  .card-name { font-size: 1.7rem; font-weight: 600; color: var(--text); letter-spacing: -0.025em; margin-bottom: 0.5rem; line-height: 1.15; }
  .card-bio { font-size: 13.5px; color: var(--muted); line-height: 1.6; margin-bottom: 1.25rem; font-weight: 300; }
  .divider { height: 1px; background: var(--border); margin: 1.1rem 0; }
  .card-section-label { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--faint); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
  .skills-wrap { display: flex; flex-wrap: wrap; gap: 7px; }
  .skill-tag { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 8px; padding: 5px 11px; font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #b5b1c7; cursor: pointer; transition: all 0.2s; user-select: none; }
  .skill-tag:hover { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 14px var(--accent-soft); }
  .skill-tag.active { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
  .projects-wrap { display: flex; flex-direction: column; gap: 9px; }
  .project-card { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); border: 1px solid var(--border); border-radius: 12px; padding: 12px 15px; text-decoration: none; color: var(--text); font-size: 13.5px; font-weight: 500; transition: all 0.2s; cursor: pointer; }
  .project-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 18px var(--accent-soft); }
  .project-card.dim { opacity: 0.4; }
  .project-arrow { color: var(--accent); font-size: 15px; }
  .github-btn { display: flex; align-items: center; justify-content: center; gap: 7px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 12px; padding: 12px; color: var(--muted); font-size: 13px; font-family: 'JetBrains Mono', monospace; text-decoration: none; transition: all 0.2s; cursor: pointer; }
  .github-btn:hover { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 16px var(--accent-soft); }
  .flip-btn { margin-top: 1.25rem; width: 100%; padding: 11px; background: rgba(255,255,255,0.04); color: var(--muted); border: 1px solid var(--border); border-radius: 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.2s; }
  .flip-btn:hover { border-color: var(--border-hover); color: var(--text); }
  .empty-state { color: var(--faint); font-size: 13px; font-family: 'JetBrains Mono', monospace; }
  .public-wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }

  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 8px; }
`

const emptyProfile = () => ({
  profile_name: "Untitled Card", username: "", full_name: "", bio: "",
  github_url: "", skills: "", project_1_name: "", project_1_url: "", project_2_name: "", project_2_url: ""
})

function Background() {
  return (<><div className="ambient" /><div className="grid-overlay" /></>)
}

function CardContent({ profile, isPreview, setFlipped, activeSkill, setActiveSkill }) {
  const hasData = profile && (profile.full_name || profile.username)
  if (!hasData) return (<div className="card-face"><div className="card-glow" /><p className="empty-state">// your card will appear here</p></div>)

  const skills = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : []
  const projects = [
    profile.project_1_name && { name: profile.project_1_name, url: profile.project_1_url },
    profile.project_2_name && { name: profile.project_2_name, url: profile.project_2_url },
  ].filter(Boolean)

  const Project = ({ p, i }) => {
    const inner = (<><span>{p.name}</span><span className="project-arrow">↗</span></>)
    const cls = "project-card" + (activeSkill ? " dim" : "")
    return isPreview
      ? <motion.div className={cls} initial={{ opacity: 0, y: 10 }} animate={{ opacity: activeSkill ? 0.4 : 1, y: 0 }} transition={{ delay: i * 0.05 }}>{inner}</motion.div>
      : <motion.a href={p.url} target="_blank" rel="noreferrer" className={cls} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>{inner}</motion.a>
  }

  return (
    <>
      <div className="card-face">
        <div className="card-glow" />
        {profile.username && <p className="card-handle">@{profile.username}</p>}
        {profile.full_name && <h1 className="card-name">{profile.full_name}</h1>}
        {profile.bio && <p className="card-bio">{profile.bio}</p>}
        {skills.length > 0 && (<><div className="divider" /><p className="card-section-label">skills</p><div className="skills-wrap">{skills.map((s, i) => (<motion.span key={s} className={"skill-tag" + (activeSkill === s ? " active" : "")} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }} onClick={() => setActiveSkill(activeSkill === s ? null : s)}>{s}</motion.span>))}</div></>)}
        <button className="flip-btn" onClick={() => setFlipped(true)}><span>view projects &amp; links</span><span>→</span></button>
      </div>
      <div className="card-face card-back">
        <div className="card-glow" />
        <p className="card-handle">@{profile.username || "devcard"}</p>
        {projects.length > 0 && (<><p className="card-section-label">projects</p><div className="projects-wrap">{projects.map((p, i) => <Project key={p.name} p={p} i={i} />)}</div><div className="divider" /></>)}
        {profile.github_url && (isPreview ? <div className="github-btn">~/github ↗</div> : <a href={profile.github_url} target="_blank" rel="noreferrer" className="github-btn">~/github ↗</a>)}
        <button className="flip-btn" onClick={() => setFlipped(false)}><span>←</span><span>back to profile</span></button>
      </div>
    </>
  )
}

function TiltCard({ profile, isPreview = false }) {
  const [flipped, setFlipped] = useState(false)
  const [activeSkill, setActiveSkill] = useState(null)
  const ref = useRef(null)
  const mx = useMotionValue(0); const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })
  const onMove = (e) => { const r = ref.current.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5) }
  const onLeave = () => { mx.set(0); my.set(0) }

  return (
    <div className="card-scene">
      <motion.div ref={ref} className="card-3d" onMouseMove={onMove} onMouseLeave={onLeave}
        style={{ rotateX: flipped ? 0 : rx, rotateY: flipped ? 180 : ry }}
        animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: "spring", stiffness: 120, damping: 18 }}
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
        <CardContent profile={profile} isPreview={isPreview} setFlipped={setFlipped} activeSkill={activeSkill} setActiveSkill={setActiveSkill} />
      </motion.div>
    </div>
  )
}

function ProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase.from("profiles").select("*").eq("username", username).single()
      .then(({ data }) => { if (data) setProfile(data); else setNotFound(true) })
  }, [username])

  return (<><Background /><div className="public-wrap">{notFound ? <p className="empty-state">// no profile found for @{username}</p> : profile ? <TiltCard profile={profile} /> : <p className="empty-state">loading...</p>}</div></>)
}

const Section = ({ icon, title, children }) => (
  <motion.div className="section" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
    <div className="section-head"><div className="section-icon">{icon}</div><span className="section-title">{title}</span><div className="section-line" /></div>
    {children}
  </motion.div>
)

// --- DASHBOARD: list of profile cards ---
function Dashboard({ user, onLogOut, onNew, onEdit }) {
  const [cards, setCards] = useState([])
  const navigate = useNavigate()

  const fetchCards = async () => {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).order("created_at", { ascending: true })
    if (data) setCards(data)
  }

  useEffect(() => { fetchCards() }, [user])

  const deleteCard = async (cardId) => {
    await supabase.from("profiles").delete().eq("card_id", cardId)
    fetchCards()
  }

  return (
    <div className="dashboard-wrap">
      <Background />
      <div className="topbar">
        <div className="editor-logo">Dev<span>Card</span></div>
        <div className="header-actions">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-sm btn-sm-accent" onClick={onNew}>+ new card</motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-sm btn-sm-ghost" onClick={onLogOut}>log out</motion.button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">your cards</h1>
            <p className="dashboard-sub">{user.email}</p>
          </div>
        </div>

        <div className="cards-grid">
          {cards.map((card, i) => (
            <motion.div key={card.card_id} className="profile-tile"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <div className="tile-glow" />
              {card.username && <p className="tile-handle">@{card.username}</p>}
              <p className="tile-name">{card.full_name || card.profile_name || "Unnamed Card"}</p>
              {card.bio && <p className="tile-bio">{card.bio}</p>}
              {card.skills && (
                <div className="tile-skills">
                  {card.skills.split(",").slice(0, 3).map(s => (
                    <span key={s} className="tile-skill">{s.trim()}</span>
                  ))}
                </div>
              )}
              <div className="tile-actions">
                <button className="tile-btn tile-btn-edit" onClick={() => onEdit(card)}>edit</button>
                {card.username && <button className="tile-btn tile-btn-view" onClick={() => navigate(`/u/${card.username}`)}>view ↗</button>}
                <button className="tile-btn-delete" onClick={() => deleteCard(card.card_id)}>✕</button>
              </div>
            </motion.div>
          ))}

          <motion.div className="new-card-tile" onClick={onNew}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: cards.length * 0.07 }}>
            <div className="new-card-icon">+</div>
            <p className="new-card-label">create new card</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// --- EDITOR: create or edit a single card ---
function CardEditor({ user, existingCard, onBack }) {
  const [profile, setProfile] = useState(existingCard || emptyProfile())
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const isNew = !existingCard

  const update = (k, v) => setProfile(p => ({ ...p, [k]: v }))

  const saveProfile = async () => {
    setSaving(true)
    const payload = { ...profile, id: user.id }
    console.log("saving payload:", payload)
    const { data, error } = isNew
      ? await supabase.from("profiles").insert(payload).select()
      : await supabase.from("profiles").update(payload).eq("card_id", existingCard.card_id).select()
    setSaving(false)
    console.log("result:", data, error)
    if (error) setMessage(error.message)
    else { setMessage("saved ✓"); setTimeout(() => onBack(), 800) }
  }

  return (
    <div className="editor-wrap">
      <Background />
      <div className="topbar">
        <div className="editor-logo">Dev<span>Card</span></div>
        <div className="header-actions">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-sm btn-sm-ghost" onClick={onBack}>← back</motion.button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-panel">
          <Section icon="◆" title="identity">
            <div className="field-group">
              <input className="input" placeholder="card name (internal label)" value={profile.profile_name || ""} onChange={e => update("profile_name", e.target.value)} />
              <input className="input" placeholder="username (used in public URL)" value={profile.username} onChange={e => update("username", e.target.value)} />
              <input className="input" placeholder="full name" value={profile.full_name} onChange={e => update("full_name", e.target.value)} />
              <textarea className="textarea" placeholder="bio — what you build and why" value={profile.bio} onChange={e => update("bio", e.target.value)} />
            </div>
          </Section>
          <Section icon="↗" title="links">
            <div className="field-group">
              <input className="input" placeholder="github url" value={profile.github_url} onChange={e => update("github_url", e.target.value)} />
            </div>
          </Section>
          <Section icon="✦" title="skills">
            <div className="field-group">
              <input className="input" placeholder="React, Python, SQL — comma separated" value={profile.skills} onChange={e => update("skills", e.target.value)} />
            </div>
          </Section>
          <Section icon="▣" title="projects">
            <div className="field-group">
              <input className="input" placeholder="project 1 name" value={profile.project_1_name} onChange={e => update("project_1_name", e.target.value)} />
              <input className="input" placeholder="project 1 url" value={profile.project_1_url} onChange={e => update("project_1_url", e.target.value)} />
              <input className="input" placeholder="project 2 name" value={profile.project_2_name} onChange={e => update("project_2_name", e.target.value)} />
              <input className="input" placeholder="project 2 url" value={profile.project_2_url} onChange={e => update("project_2_url", e.target.value)} />
            </div>
          </Section>

          {message && <motion.p className="msg" style={{ marginTop: "1.25rem" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{message}</motion.p>}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="save-btn" onClick={saveProfile}>{saving ? "saving..." : isNew ? "create card" : "save changes"}</motion.button>
        </div>

        <div className="preview-panel">
          <p className="preview-label">live preview</p>
          <TiltCard profile={profile} isPreview={true} />
        </div>
      </div>
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

// --- LOGIN ---
function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [step, setStep] = useState("auth") // auth | otp
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const signUp = async () => {
    if (!email || !password) return setMessage("enter your email and password")
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) setMessage(error.message)
    else { setStep("otp"); setMessage("") }
  }

  const verifyOtp = async () => {
    if (otp.length < 6) return setMessage("enter the 6-digit code from your email")
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" })
    setLoading(false)
    if (error) setMessage(error.message)
  }

  const resendOtp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resend({ type: "signup", email })
    setLoading(false)
    setMessage(error ? error.message : "code resent ✓")
  }

  const logIn = async () => {
    if (!email || !password) return setMessage("enter your email and password")
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setMessage(error.message)
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    })
    if (error) setMessage(
      error.message.includes("provider is not enabled")
        ? "google sign-in isn't configured yet — enable it in your Supabase dashboard"
        : error.message
    )
  }

  const headerMotion = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }
  const cardMotion = { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.15 } }

  if (step === "otp") return (
    <>
      <Background />
      <div className="login-wrap">
        <motion.div {...headerMotion} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="login-logo">~/devcard</p>
          <h1 className="login-title" style={{ fontSize: "2rem" }}>check your email</h1>
          <p className="login-sub">6-digit code sent to <strong style={{ color: "var(--text)" }}>{email}</strong></p>
        </motion.div>
        <motion.div className="glass-card login-card" {...cardMotion}>
          <input
            className="otp-input" placeholder="000000" value={otp} maxLength={6} inputMode="numeric"
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => e.key === "Enter" && verifyOtp()}
          />
          <p className="otp-hint">enter the code from the confirmation email</p>
          {message && <p className="msg" style={{ textAlign: "center" }}>{message}</p>}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" onClick={verifyOtp} disabled={loading}>
            {loading ? "verifying..." : "verify email"}
          </motion.button>
          <div className="auth-row">
            <button className="text-btn" onClick={resendOtp} disabled={loading}>resend code</button>
            <button className="text-btn" onClick={() => { setStep("auth"); setOtp(""); setMessage("") }}>← back</button>
          </div>
        </motion.div>
      </div>
    </>
  )

  return (
    <>
      <Background />
      <div className="login-wrap">
        <motion.div {...headerMotion} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="login-logo">~/devcard</p>
          <h1 className="login-title">DevCard</h1>
          <p className="login-sub">your developer profile, shareable anywhere</p>
        </motion.div>
        <motion.div className="glass-card login-card" {...cardMotion}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-google" onClick={signInWithGoogle}>
            <GoogleIcon /> continue with google
          </motion.button>
          <div className="auth-divider">or</div>
          <input type="email" className="input" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && logIn()} />
          <input type="password" className="input" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && logIn()} />
          {message && <p className="msg">{message}</p>}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" onClick={logIn} disabled={loading}>
            {loading ? "logging in..." : "log in"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-ghost" onClick={signUp} disabled={loading}>
            {loading ? "creating..." : "create account"}
          </motion.button>
        </motion.div>
      </div>
    </>
  )
}

// --- MAIN ---
function Main() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState("dashboard") // dashboard | new | edit
  const [editingCard, setEditingCard] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null))
  }, [])

  const logOut = async () => { await supabase.auth.signOut(); setUser(null); setView("dashboard") }

  if (!user) return <Login />

  if (view === "new") return <CardEditor user={user} existingCard={null} onBack={() => setView("dashboard")} />
  if (view === "edit") return <CardEditor user={user} existingCard={editingCard} onBack={() => { setEditingCard(null); setView("dashboard") }} />

  return (
    <Dashboard
      user={user} onLogOut={logOut}
      onNew={() => setView("new")}
      onEdit={(card) => { setEditingCard(card); setView("edit") }}
    />
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <style>{styles}</style>
      <Routes>
        <Route path="/u/:username" element={<ProfilePage />} />
        <Route path="/*" element={<Main />} />
      </Routes>
    </BrowserRouter>
  )
}