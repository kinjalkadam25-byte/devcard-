import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import LandingPage from "./LandingPage"

// ─── helpers ────────────────────────────────────────────────────────────────

function getAvatarColor(str = "") {
  const palette = [
    ["rgba(255,107,53,0.18)", "#ff7a4d"],
    ["rgba(139,127,255,0.18)", "#9d8fff"],
    ["rgba(52,211,153,0.18)", "#34d399"],
    ["rgba(96,165,250,0.18)", "#60a5fa"],
    ["rgba(236,72,153,0.18)", "#ec72a0"],
    ["rgba(251,191,36,0.18)", "#fbbf24"],
  ]
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return palette[Math.abs(h) % palette.length]
}

function getInitials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? "").join("") || "?"
}

// ─── styles ─────────────────────────────────────────────────────────────────

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #07070c; --accent: #FF6B35; --accent-soft: rgba(255,107,53,0.14);
    --text: #f2f0ff; --muted: #8b8799; --faint: #4a4757;
    --border: rgba(255,255,255,0.07); --border-hover: rgba(255,255,255,0.14);
    --glass: rgba(20,19,28,0.65); --surface: rgba(28,26,40,0.6);
  }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; -webkit-font-smoothing: antialiased; }

  /* BACKGROUND */
  .ambient {
    position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden;
    background: radial-gradient(600px circle at 15% 20%, rgba(255,107,53,0.09), transparent 45%),
      radial-gradient(700px circle at 85% 75%, rgba(139,127,255,0.09), transparent 45%),
      linear-gradient(180deg, #07070c 0%, #0a0910 100%);
  }
  .grid-overlay {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 90%);
  }

  /* TOPBAR */
  .topbar { position: sticky; top: 0; z-index: 20; display: flex; justify-content: space-between; align-items: center; padding: 0 28px; height: 60px; background: rgba(7,7,12,0.8); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--border); }
  .logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .logo-mark { width: 30px; height: 30px; border-radius: 9px; background: var(--accent); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .logo-text { font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600; color: var(--text); letter-spacing: -0.02em; }
  .logo-text span { color: var(--accent); }
  .header-actions { display: flex; gap: 8px; align-items: center; }
  .header-user { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--faint); margin-right: 6px; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .btn-sm { padding: 7px 15px; border-radius: 9px; font-size: 13px; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 500; display: inline-flex; align-items: center; gap: 6px; transition: all 0.18s; border: none; }
  .btn-sm-ghost { background: rgba(255,255,255,0.04); color: var(--muted); border: 1px solid var(--border) !important; }
  .btn-sm-ghost:hover { border-color: var(--border-hover) !important; color: var(--text); background: rgba(255,255,255,0.07); }
  .btn-sm-accent { background: var(--accent); color: #1a0d05; font-weight: 600; box-shadow: 0 4px 14px rgba(255,107,53,0.22); }
  .btn-sm-accent:hover { opacity: 0.9; }

  /* LOGIN */
  .login-wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; }
  .login-brand { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }
  .login-brand-mark { width: 44px; height: 44px; border-radius: 13px; background: var(--accent); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 28px rgba(255,107,53,0.3); }
  .login-brand-name { font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 600; color: var(--text); letter-spacing: -0.03em; }
  .login-brand-name span { color: var(--accent); }
  .login-sub { font-size: 14.5px; color: var(--muted); margin-bottom: 2.25rem; font-weight: 300; text-align: center; line-height: 1.5; }
  .glass-card { background: var(--glass); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); border: 1px solid var(--border); border-radius: 20px; box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04); }
  .login-card { padding: 1.75rem; width: 100%; max-width: 370px; display: flex; flex-direction: column; gap: 12px; }

  /* INPUTS */
  .field-wrap { display: flex; flex-direction: column; gap: 5px; }
  .field-label { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--muted); letter-spacing: 0.08em; }
  .input { background: rgba(0,0,0,0.28); border: 1px solid var(--border); border-radius: 11px; padding: 12px 14px; color: var(--text); font-size: 14px; font-family: 'Inter', sans-serif; outline: none; width: 100%; transition: border-color 0.18s, box-shadow 0.18s; }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .input::placeholder { color: var(--faint); }
  .textarea { background: rgba(0,0,0,0.28); border: 1px solid var(--border); border-radius: 11px; padding: 12px 14px; color: var(--text); font-size: 14px; font-family: 'Inter', sans-serif; outline: none; width: 100%; resize: none; height: 88px; line-height: 1.6; transition: border-color 0.18s, box-shadow 0.18s; }
  .textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .textarea::placeholder { color: var(--faint); }

  /* BUTTONS */
  .btn-primary { background: var(--accent); color: #1a0d05; border: none; border-radius: 11px; padding: 13px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; box-shadow: 0 6px 20px rgba(255,107,53,0.22); transition: opacity 0.18s; }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn-ghost { background: rgba(255,255,255,0.03); color: var(--muted); border: 1px solid var(--border); border-radius: 11px; padding: 13px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.18s; }
  .btn-ghost:hover { border-color: var(--border-hover); color: var(--text); background: rgba(255,255,255,0.06); }
  .btn-google { display: flex; align-items: center; justify-content: center; gap: 9px; background: rgba(255,255,255,0.04); color: var(--text); border: 1px solid var(--border); border-radius: 11px; padding: 12px; font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.18s; width: 100%; }
  .btn-google:hover { border-color: var(--border-hover); background: rgba(255,255,255,0.08); }
  .auth-divider { display: flex; align-items: center; gap: 12px; color: var(--faint); font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.12em; }
  .auth-divider::before, .auth-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .otp-input { background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 12px; padding: 18px 16px; color: var(--text); font-size: 26px; font-family: 'JetBrains Mono', monospace; outline: none; width: 100%; text-align: center; letter-spacing: 0.5em; transition: border-color 0.2s, box-shadow 0.2s; }
  .otp-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
  .otp-input::placeholder { letter-spacing: 0.35em; color: var(--faint); font-size: 20px; }
  .otp-hint { font-size: 12.5px; color: var(--muted); font-family: 'JetBrains Mono', monospace; text-align: center; line-height: 1.5; }
  .auth-row { display: flex; justify-content: space-between; align-items: center; }
  .text-btn { background: none; border: none; color: var(--faint); font-size: 12px; font-family: 'JetBrains Mono', monospace; cursor: pointer; padding: 0; transition: color 0.18s; }
  .text-btn:hover { color: var(--text); }
  .msg { font-size: 12.5px; color: var(--accent); font-family: 'JetBrains Mono', monospace; }

  /* DASHBOARD */
  .dashboard-wrap { position: relative; z-index: 1; min-height: 100vh; }
  .dashboard-content { max-width: 1100px; margin: 0 auto; padding: 2.5rem 2rem; }
  .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2.25rem; }
  .dashboard-title { font-size: 1.45rem; font-weight: 600; letter-spacing: -0.025em; }
  .dashboard-sub { font-size: 12px; color: var(--faint); margin-top: 5px; font-family: 'JetBrains Mono', monospace; }
  .dashboard-count { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-family: 'JetBrains Mono', monospace; color: var(--muted); background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 20px; padding: 4px 12px; margin-top: 8px; }
  .count-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

  .cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

  .profile-tile {
    background: linear-gradient(160deg, rgba(26,24,38,0.9), rgba(14,13,21,0.95));
    border: 1px solid var(--border); border-radius: 18px; padding: 1.4rem;
    position: relative; overflow: hidden; cursor: pointer;
    transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    display: flex; flex-direction: column;
  }
  .profile-tile:hover { border-color: rgba(255,107,53,0.3); transform: translateY(-3px); box-shadow: 0 20px 50px rgba(0,0,0,0.45), 0 0 24px rgba(255,107,53,0.07); }
  .tile-glow { position: absolute; top: -1px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0.7; }

  .tile-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  .tile-avatar { border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; width: 38px; height: 38px; flex-shrink: 0; }
  .tile-badges { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
  .tile-badge-public { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #34d399; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.2); border-radius: 5px; padding: 2px 8px; letter-spacing: 0.05em; }
  .tile-badge-draft { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--faint); background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 5px; padding: 2px 8px; letter-spacing: 0.05em; }

  .tile-handle { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent); letter-spacing: 0.06em; margin-bottom: 4px; }
  .tile-name { font-size: 1.05rem; font-weight: 600; color: var(--text); letter-spacing: -0.02em; margin-bottom: 5px; }
  .tile-bio { font-size: 12.5px; color: var(--muted); line-height: 1.55; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
  .tile-skills { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 1rem; }
  .tile-skill { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 5px; padding: 3px 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #b5b1c7; }
  .tile-actions { display: flex; gap: 7px; margin-top: auto; }
  .tile-btn { flex: 1; padding: 8px; border-radius: 8px; font-size: 12px; cursor: pointer; font-family: 'JetBrains Mono', monospace; transition: all 0.18s; text-align: center; border: 1px solid transparent; }
  .tile-btn-edit { background: rgba(255,107,53,0.1); color: var(--accent); border-color: rgba(255,107,53,0.18); }
  .tile-btn-edit:hover { background: rgba(255,107,53,0.18); border-color: var(--accent); }
  .tile-btn-view { background: rgba(255,255,255,0.04); color: var(--muted); border-color: var(--border); }
  .tile-btn-view:hover { border-color: var(--border-hover); color: var(--text); }
  .tile-btn-copy { background: rgba(52,211,153,0.07); color: #34d399; border-color: rgba(52,211,153,0.18); padding: 8px 10px; }
  .tile-btn-copy:hover { background: rgba(52,211,153,0.14); border-color: rgba(52,211,153,0.35); }
  .tile-btn-delete { background: rgba(255,60,60,0.07); color: #ff6060; border: 1px solid rgba(255,60,60,0.14); padding: 8px 11px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all 0.18s; display: flex; align-items: center; justify-content: center; }
  .tile-btn-delete:hover { background: rgba(255,60,60,0.16); border-color: rgba(255,60,60,0.32); }

  .new-card-tile {
    border: 1px dashed rgba(255,255,255,0.1); border-radius: 18px; padding: 1.4rem;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; cursor: pointer; min-height: 210px;
    transition: border-color 0.2s, background 0.2s;
  }
  .new-card-tile:hover { border-color: var(--accent); background: rgba(255,107,53,0.04); }
  .new-card-icon-wrap { width: 44px; height: 44px; border-radius: 13px; border: 1px dashed rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
  .new-card-tile:hover .new-card-icon-wrap { border-color: var(--accent); background: rgba(255,107,53,0.1); }
  .new-card-plus { font-size: 22px; color: var(--faint); transition: color 0.2s; line-height: 1; }
  .new-card-tile:hover .new-card-plus { color: var(--accent); }
  .new-card-label { font-size: 13px; color: var(--faint); font-family: 'JetBrains Mono', monospace; transition: color 0.2s; }
  .new-card-tile:hover .new-card-label { color: var(--accent); }
  .new-card-hint { font-size: 11px; color: var(--faint); font-family: 'JetBrains Mono', monospace; opacity: 0.6; }

  /* EDITOR */
  .editor-wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; }
  .editor-grid { display: grid; grid-template-columns: 1fr 1fr; flex: 1; min-height: calc(100vh - 60px); }
  @media (max-width: 860px) { .editor-grid { grid-template-columns: 1fr; } .preview-panel { display: none; } }
  .editor-panel { padding: 2rem 2.25rem 4rem; border-right: 1px solid var(--border); max-height: calc(100vh - 60px); overflow-y: auto; position: relative; }

  .section { margin-top: 1.75rem; }
  .section:first-of-type { margin-top: 0.25rem; }
  .section-head { display: flex; align-items: center; gap: 9px; margin-bottom: 14px; }
  .section-icon { width: 26px; height: 26px; border-radius: 7px; display: flex; align-items: center; justify-content: center; background: var(--accent-soft); color: var(--accent); flex-shrink: 0; }
  .section-title { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: var(--muted); letter-spacing: 0.15em; text-transform: uppercase; font-weight: 500; }
  .section-line { flex: 1; height: 1px; background: var(--border); }
  .field-group { display: flex; flex-direction: column; gap: 12px; }
  .save-btn { margin-top: 2rem; width: 100%; padding: 14px; background: var(--accent); color: #1a0d05; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.03em; box-shadow: 0 6px 24px rgba(255,107,53,0.2); transition: opacity 0.18s; }
  .save-btn:hover { opacity: 0.9; }
  .save-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .preview-panel { padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; position: sticky; top: 60px; height: calc(100vh - 60px); }
  .preview-label { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--faint); letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 1.75rem; display: flex; align-items: center; gap: 8px; }
  .preview-dot { width: 6px; height: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px #34d399; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  /* CARD */
  .card-scene { perspective: 1400px; width: 100%; max-width: 370px; }
  .card-3d { position: relative; width: 100%; transform-style: preserve-3d; }
  .card-face { border-radius: 22px; padding: 1.75rem; background: linear-gradient(160deg, rgba(28,26,40,0.88), rgba(14,13,21,0.95)); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid var(--border); box-shadow: 0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05); position: relative; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
  .card-back { position: absolute; inset: 0; transform: rotateY(180deg); }
  .card-glow { position: absolute; top: -1px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); }
  .card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.9rem; }
  .card-avatar { border-radius: 11px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600; width: 42px; height: 42px; flex-shrink: 0; }
  .card-handle { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--accent); letter-spacing: 0.06em; margin-top: 3px; }
  .card-name { font-size: 1.6rem; font-weight: 600; color: var(--text); letter-spacing: -0.025em; margin-bottom: 0.45rem; line-height: 1.15; }
  .card-bio { font-size: 13px; color: var(--muted); line-height: 1.65; margin-bottom: 1.1rem; font-weight: 300; }
  .divider { height: 1px; background: var(--border); margin: 1rem 0; }
  .card-section-label { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: var(--faint); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 9px; }
  .skills-wrap { display: flex; flex-wrap: wrap; gap: 6px; }
  .skill-tag { background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 7px; padding: 5px 10px; font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #b5b1c7; cursor: pointer; transition: all 0.18s; user-select: none; }
  .skill-tag:hover { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 12px var(--accent-soft); }
  .skill-tag.active { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
  .projects-wrap { display: flex; flex-direction: column; gap: 8px; }
  .project-card { display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.22); border: 1px solid var(--border); border-radius: 11px; padding: 11px 14px; text-decoration: none; color: var(--text); font-size: 13px; font-weight: 500; transition: all 0.18s; cursor: pointer; }
  .project-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 16px var(--accent-soft); }
  .project-card.dim { opacity: 0.4; }
  .project-arrow { color: var(--accent); font-size: 14px; }
  .github-btn { display: flex; align-items: center; justify-content: center; gap: 7px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 11px; padding: 11px; color: var(--muted); font-size: 12px; font-family: 'JetBrains Mono', monospace; text-decoration: none; transition: all 0.18s; cursor: pointer; }
  .github-btn:hover { border-color: var(--accent); color: var(--accent); box-shadow: 0 0 14px var(--accent-soft); }
  .flip-btn { margin-top: 1.1rem; width: 100%; padding: 10px; background: rgba(255,255,255,0.04); color: var(--muted); border: 1px solid var(--border); border-radius: 11px; font-size: 11px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.18s; }
  .flip-btn:hover { border-color: var(--border-hover); color: var(--text); }
  .empty-state { color: var(--faint); font-size: 13px; font-family: 'JetBrains Mono', monospace; }
  .public-wrap { position: relative; z-index: 1; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }

  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 8px; }
`

// ─── components ──────────────────────────────────────────────────────────────

const emptyProfile = () => ({
  profile_name: "Untitled Card", username: "", full_name: "", bio: "",
  github_url: "", skills: "", project_1_name: "", project_1_url: "", project_2_name: "", project_2_url: ""
})

function Background() {
  return (<><div className="ambient" /><div className="grid-overlay" /></>)
}

function LogoMark({ size = 30, radius = 9 }) {
  return (
    <div className="logo-mark" style={{ width: size, height: size, borderRadius: radius }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 16 16" fill="none">
        <path d="M5 4L2 8l3 4M11 4l3 4-3 4M9 3l-2 10" stroke="#1a0d05" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function AvatarBox({ name = "", size = 38, radius = 10 }) {
  const initials = getInitials(name)
  const [bg, color] = getAvatarColor(name)
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: bg, border: `1px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: size * 0.36, fontWeight: 600, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

// ─── SVG section icons ───────────────────────────────────────────────────────

const IconIdentity = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2.5 12c0-2.485 2.015-4.5 4.5-4.5s4.5 2.015 4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const IconLinks = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5.5 8.5l3-3M6 4.5H4a2.5 2.5 0 000 5h1.5M8 9.5H10a2.5 2.5 0 000-5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const IconSkills = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.5l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9.5 4 11l.5-3.5L2 5l3.5-.5L7 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
)
const IconProjects = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
    <rect x="8" y="1.5" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
    <rect x="1.5" y="8" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
    <rect x="8" y="8" width="4.5" height="4.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
    <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M4 3.5l.7 8h4.6l.7-8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const IconCopy = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
    <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M4 10H3a1.5 1.5 0 01-1.5-1.5v-6A1.5 1.5 0 013 1h6A1.5 1.5 0 0110.5 2.5V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

// ─── card content ────────────────────────────────────────────────────────────

function CardContent({ profile, isPreview, setFlipped, activeSkill, setActiveSkill }) {
  const hasData = profile && (profile.full_name || profile.username)
  if (!hasData) return (
    <div className="card-face">
      <div className="card-glow" />
      <p className="empty-state">// your card will appear here</p>
    </div>
  )

  const skills = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean) : []
  const projects = [
    profile.project_1_name && { name: profile.project_1_name, url: profile.project_1_url },
    profile.project_2_name && { name: profile.project_2_name, url: profile.project_2_url },
  ].filter(Boolean)

  const displayName = profile.full_name || profile.username || ""
  const [avatarBg, avatarColor] = getAvatarColor(displayName)

  const Project = ({ p, i }) => {
    const inner = (<><span>{p.name}</span><span className="project-arrow">↗</span></>)
    const cls = "project-card" + (activeSkill ? " dim" : "")
    return isPreview
      ? <motion.div className={cls} initial={{ opacity: 0, y: 8 }} animate={{ opacity: activeSkill ? 0.4 : 1, y: 0 }} transition={{ delay: i * 0.05 }}>{inner}</motion.div>
      : <motion.a href={p.url} target="_blank" rel="noreferrer" className={cls} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>{inner}</motion.a>
  }

  return (
    <>
      <div className="card-face">
        <div className="card-glow" />
        <div className="card-top">
          <div className="card-avatar" style={{ background: avatarBg, border: `1px solid ${avatarColor}40`, color: avatarColor, fontSize: 15 }}>
            {getInitials(displayName)}
          </div>
          {profile.username && <p className="card-handle">@{profile.username}</p>}
        </div>
        {profile.full_name && <h1 className="card-name">{profile.full_name}</h1>}
        {profile.bio && <p className="card-bio">{profile.bio}</p>}
        {skills.length > 0 && (
          <>
            <div className="divider" />
            <p className="card-section-label">skills</p>
            <div className="skills-wrap">
              {skills.map((s, i) => (
                <motion.span key={s} className={"skill-tag" + (activeSkill === s ? " active" : "")}
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setActiveSkill(activeSkill === s ? null : s)}>
                  {s}
                </motion.span>
              ))}
            </div>
          </>
        )}
        <button className="flip-btn" onClick={() => setFlipped(true)}>
          <span>view projects &amp; links</span><span>→</span>
        </button>
      </div>

      <div className="card-face card-back">
        <div className="card-glow" />
        <p className="card-handle" style={{ marginBottom: "1rem" }}>@{profile.username || "devcard"}</p>
        {projects.length > 0 && (
          <>
            <p className="card-section-label">projects</p>
            <div className="projects-wrap">
              {projects.map((p, i) => <Project key={p.name} p={p} i={i} />)}
            </div>
            <div className="divider" />
          </>
        )}
        {profile.github_url && (
          isPreview
            ? <div className="github-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                ~/github ↗
              </div>
            : <a href={profile.github_url} target="_blank" rel="noreferrer" className="github-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                ~/github ↗
              </a>
        )}
        <button className="flip-btn" onClick={() => setFlipped(false)}>
          <span>←</span><span>back to profile</span>
        </button>
      </div>
    </>
  )
}

// ─── tilt card ───────────────────────────────────────────────────────────────

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
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <CardContent profile={profile} isPreview={isPreview} setFlipped={setFlipped} activeSkill={activeSkill} setActiveSkill={setActiveSkill} />
      </motion.div>
    </div>
  )
}

// ─── public profile page ──────────────────────────────────────────────────────

function ProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    supabase.from("profiles").select("*").eq("username", username).single()
      .then(({ data }) => { if (data) setProfile(data); else setNotFound(true) })
  }, [username])

  return (
    <>
      <Background />
      <div className="public-wrap">
        {notFound
          ? <p className="empty-state">// no profile found for @{username}</p>
          : profile ? <TiltCard profile={profile} /> : <p className="empty-state">loading...</p>
        }
      </div>
    </>
  )
}

// ─── section wrapper ──────────────────────────────────────────────────────────

const Section = ({ icon, title, children }) => (
  <motion.div className="section" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
    <div className="section-head">
      <div className="section-icon">{icon}</div>
      <span className="section-title">{title}</span>
      <div className="section-line" />
    </div>
    {children}
  </motion.div>
)

// ─── dashboard ───────────────────────────────────────────────────────────────

function Dashboard({ user, onLogOut, onNew, onEdit }) {
  const [cards, setCards] = useState([])
  const [copied, setCopied] = useState(null)
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

  const copyLink = (username) => {
    const url = `${window.location.origin}/u/${username}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(username)
      setTimeout(() => setCopied(null), 1800)
    })
  }

  return (
    <div className="dashboard-wrap">
      <Background />
      <div className="topbar">
        <div className="logo">
          <LogoMark />
          <span className="logo-text">Dev<span>Card</span></span>
        </div>
        <div className="header-actions">
          <span className="header-user">{user.email}</span>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-sm btn-sm-accent" onClick={onNew}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            new card
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-sm btn-sm-ghost" onClick={onLogOut}>log out</motion.button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">your cards</h1>
            <p className="dashboard-sub">{user.email}</p>
            {cards.length > 0 && (
              <div className="dashboard-count">
                <span className="count-dot" />
                {cards.length} card{cards.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>

        <div className="cards-grid">
          {cards.map((card, i) => (
            <motion.div key={card.card_id} className="profile-tile"
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="tile-glow" />
              <div className="tile-header">
                <AvatarBox name={card.full_name || card.profile_name || card.username || ""} />
                <div className="tile-badges">
                  {card.username
                    ? <span className="tile-badge-public">public</span>
                    : <span className="tile-badge-draft">draft</span>
                  }
                </div>
              </div>
              {card.username && <p className="tile-handle">@{card.username}</p>}
              <p className="tile-name">{card.full_name || card.profile_name || "Unnamed Card"}</p>
              {card.bio && <p className="tile-bio">{card.bio}</p>}
              {card.skills && (
                <div className="tile-skills">
                  {card.skills.split(",").slice(0, 3).map(s => (
                    <span key={s} className="tile-skill">{s.trim()}</span>
                  ))}
                  {card.skills.split(",").length > 3 && (
                    <span className="tile-skill">+{card.skills.split(",").length - 3}</span>
                  )}
                </div>
              )}
              <div className="tile-actions">
                <button className="tile-btn tile-btn-edit" onClick={() => onEdit(card)}>edit</button>
                {card.username && (
                  <button className="tile-btn tile-btn-view" onClick={() => navigate(`/u/${card.username}`)}>view ↗</button>
                )}
                {card.username && (
                  <button className="tile-btn tile-btn-copy" onClick={() => copyLink(card.username)} title="copy public link">
                    {copied === card.username ? "✓" : <IconCopy />}
                  </button>
                )}
                <button className="tile-btn-delete" onClick={() => deleteCard(card.card_id)} title="delete">
                  <IconTrash />
                </button>
              </div>
            </motion.div>
          ))}

          <motion.div className="new-card-tile" onClick={onNew}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: cards.length * 0.06 }}>
            <div className="new-card-icon-wrap">
              <span className="new-card-plus">+</span>
            </div>
            <p className="new-card-label">create new card</p>
            <p className="new-card-hint">shareable developer profile</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ─── card editor ──────────────────────────────────────────────────────────────

function CardEditor({ user, existingCard, onBack }) {
  const [profile, setProfile] = useState(existingCard || emptyProfile())
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const isNew = !existingCard

  const update = (k, v) => setProfile(p => ({ ...p, [k]: v }))

  const saveProfile = async () => {
    setSaving(true)
    const payload = { ...profile, id: user.id }
    const { data, error } = isNew
      ? await supabase.from("profiles").insert(payload).select()
      : await supabase.from("profiles").update(payload).eq("card_id", existingCard.card_id).select()
    setSaving(false)
    if (error) setMessage(error.message)
    else { setMessage("saved ✓"); setTimeout(() => onBack(), 800) }
  }

  const Field = ({ label, children }) => (
    <div className="field-wrap">
      <span className="field-label">{label}</span>
      {children}
    </div>
  )

  return (
    <div className="editor-wrap">
      <Background />
      <div className="topbar">
        <div className="logo">
          <LogoMark />
          <span className="logo-text">Dev<span>Card</span></span>
        </div>
        <div className="header-actions">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-sm btn-sm-ghost" onClick={onBack}>← back</motion.button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-panel">
          <Section icon={<IconIdentity />} title="identity">
            <div className="field-group">
              <Field label="card name">
                <input className="input" placeholder="e.g. Main Profile" value={profile.profile_name || ""} onChange={e => update("profile_name", e.target.value)} />
              </Field>
              <Field label="username · used in public url">
                <input className="input" placeholder="yourname" value={profile.username} onChange={e => update("username", e.target.value.toLowerCase().replace(/\s+/g, ""))} />
              </Field>
              <Field label="full name">
                <input className="input" placeholder="Jane Doe" value={profile.full_name} onChange={e => update("full_name", e.target.value)} />
              </Field>
              <Field label="bio">
                <textarea className="textarea" placeholder="what you build and why" value={profile.bio} onChange={e => update("bio", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section icon={<IconLinks />} title="links">
            <div className="field-group">
              <Field label="github url">
                <input className="input" placeholder="https://github.com/yourname" value={profile.github_url} onChange={e => update("github_url", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section icon={<IconSkills />} title="skills">
            <div className="field-group">
              <Field label="comma-separated">
                <input className="input" placeholder="React, Python, SQL, Go…" value={profile.skills} onChange={e => update("skills", e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section icon={<IconProjects />} title="projects">
            <div className="field-group">
              <Field label="project 1 — name">
                <input className="input" placeholder="My Awesome App" value={profile.project_1_name} onChange={e => update("project_1_name", e.target.value)} />
              </Field>
              <Field label="project 1 — url">
                <input className="input" placeholder="https://..." value={profile.project_1_url} onChange={e => update("project_1_url", e.target.value)} />
              </Field>
              <Field label="project 2 — name">
                <input className="input" placeholder="Another Project" value={profile.project_2_name} onChange={e => update("project_2_name", e.target.value)} />
              </Field>
              <Field label="project 2 — url">
                <input className="input" placeholder="https://..." value={profile.project_2_url} onChange={e => update("project_2_url", e.target.value)} />
              </Field>
            </div>
          </Section>

          {message && (
            <motion.p className="msg" style={{ marginTop: "1.25rem" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {message}
            </motion.p>
          )}
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="save-btn" disabled={saving} onClick={saveProfile}>
            {saving ? "saving…" : isNew ? "create card" : "save changes"}
          </motion.button>
        </div>

        <div className="preview-panel">
          <p className="preview-label">
            <span className="preview-dot" />
            live preview
          </p>
          <TiltCard profile={profile} isPreview={true} />
        </div>
      </div>
    </div>
  )
}

// ─── google icon ──────────────────────────────────────────────────────────────

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

// ─── login ────────────────────────────────────────────────────────────────────

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [step, setStep] = useState("auth")
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

  const hdr = { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45 } }
  const crd = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, delay: 0.12 } }

  if (step === "otp") return (
    <>
      <Background />
      <div className="login-wrap">
        <motion.div {...hdr} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="login-brand">
            <div className="login-brand-mark"><svg width="24" height="24" viewBox="0 0 16 16" fill="none"><path d="M5 4L2 8l3 4M11 4l3 4-3 4M9 3l-2 10" stroke="#1a0d05" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <span className="login-brand-name">Dev<span>Card</span></span>
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 600, letterSpacing: "-0.03em", marginBottom: "0.4rem" }}>check your email</h1>
          <p className="login-sub">6-digit code sent to <strong style={{ color: "var(--text)" }}>{email}</strong></p>
        </motion.div>
        <motion.div className="glass-card login-card" {...crd}>
          <input className="otp-input" placeholder="000000" value={otp} maxLength={6} inputMode="numeric"
            onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={e => e.key === "Enter" && verifyOtp()} />
          <p className="otp-hint">enter the code from the confirmation email</p>
          {message && <p className="msg" style={{ textAlign: "center" }}>{message}</p>}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" onClick={verifyOtp} disabled={loading}>
            {loading ? "verifying…" : "verify email"}
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
        <motion.div {...hdr} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="login-brand">
            <div className="login-brand-mark">
              <svg width="24" height="24" viewBox="0 0 16 16" fill="none"><path d="M5 4L2 8l3 4M11 4l3 4-3 4M9 3l-2 10" stroke="#1a0d05" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <span className="login-brand-name">Dev<span>Card</span></span>
          </div>
          <p className="login-sub">your developer profile,<br />shareable anywhere</p>
        </motion.div>
        <motion.div className="glass-card login-card" {...crd}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-google" onClick={signInWithGoogle}>
            <GoogleIcon /> continue with google
          </motion.button>
          <div className="auth-divider">or</div>
          <input type="email" className="input" placeholder="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && logIn()} />
          <input type="password" className="input" placeholder="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && logIn()} />
          {message && <p className="msg">{message}</p>}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary" onClick={logIn} disabled={loading}>
            {loading ? "logging in…" : "log in"}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-ghost" onClick={signUp} disabled={loading}>
            {loading ? "creating…" : "create account"}
          </motion.button>
        </motion.div>
      </div>
    </>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────

function Main() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState("dashboard")
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
    <Dashboard user={user} onLogOut={logOut}
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/u/:username" element={<ProfilePage />} />
        <Route path="/app/*" element={<Main />} />
        <Route path="/*" element={<Main />} />
      </Routes>
    </BrowserRouter>
  )
}
