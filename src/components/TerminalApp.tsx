"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo, Component, type ReactNode } from "react";

// ===== ERROR BOUNDARY =====
interface EBState { hasError: boolean; error: string }
class ErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  state: EBState = { hasError: false, error: "" };
  static getDerivedStateFromError(e: Error) {
    return { hasError: true, error: e.message || "未知错误" };
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight: "100dvh", background: "#0a0a0a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "monospace", color: "#ff0040", padding: 32, gap: 16 }}>
        <div style={{ fontSize: 28, fontWeight: 700 }}>[SYSTEM ERROR]</div>
        <div style={{ fontSize: 16, color: "#484f58", maxWidth: 400, textAlign: "center", wordBreak: "break-all" }}>{this.state.error}</div>
        <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: "14px 32px", background: "#00ff41", color: "#0a0a0a", border: "none", fontFamily: "monospace", fontSize: 16, fontWeight: 700, cursor: "pointer", borderRadius: 4 }}>
          [ 重新加载 ]
        </button>
      </div>
    );
  }
}

// ===== TYPES =====
interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  groupName: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}
interface Note {
  id: number;
  title: string;
  content: string | null;
  createdAt: string;
  updatedAt: string;
}
interface CtxMenu {
  x: number;
  y: number;
  type: "task" | "note";
  item: Task | Note;
}

// ===== SOUND ENGINE (共享 AudioContext + 节流) =====
let _sharedAC: AudioContext | null = null;
let _lastSoundTime = 0;
const SOUND_THROTTLE_MS = 25; // 最小间隔25ms，防止快速打字时崩溃

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  if (!_sharedAC || _sharedAC.state === "closed") {
    _sharedAC = new window.AudioContext();
  }
  if (_sharedAC.state === "suspended") {
    _sharedAC.resume();
  }
  return _sharedAC;
}

function playBeep() {
  try {
    const ac = getAudioCtx();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);
    osc.frequency.value = 880;
    osc.type = "square";
    g.gain.value = 0.06;
    osc.start();
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
    osc.stop(ac.currentTime + 0.12);
  } catch {}
}

// ===== 多种打字音效 =====
type SoundStyle = "mech" | "bubble" | "click" | "laser" | "off";
const SOUND_LABELS: Record<SoundStyle, string> = {
  mech: "⌨️ 机械",
  bubble: "🫧 泡泡",
  click: "👆 哒哒",
  laser: "⚡ 激光",
  off: "🔇 静音",
};
const SOUND_ORDER: SoundStyle[] = ["mech", "bubble", "click", "laser", "off"];
let currentSoundStyle: SoundStyle = "mech";

function setGlobalSoundStyle(s: SoundStyle) { currentSoundStyle = s; }
function getGlobalSoundStyle(): SoundStyle { return currentSoundStyle; }

function playTypeSound() {
  const style = getGlobalSoundStyle();
  if (style === "off") return;
  try {
    const now = Date.now();
    if (now - _lastSoundTime < SOUND_THROTTLE_MS) return; // 节流：跳过太快的按键
    _lastSoundTime = now;
    const ac = getAudioCtx();
    if (!ac) return;
    switch (style) {
      case "mech": playMech(ac); break;
      case "bubble": playBubble(ac); break;
      case "click": playClick(ac); break;
      case "laser": playLaser(ac); break;
    }
  } catch {}
}

// 机械键盘 — 清脆方波敲击
function playMech(ac: AudioContext) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const f = ac.createBiquadFilter();
  osc.connect(f); f.connect(g); g.connect(ac.destination);
  osc.frequency.value = 1200 + Math.random() * 600;
  osc.type = "square";
  f.type = "highpass"; f.frequency.value = 800;
  g.gain.setValueAtTime(0.05, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);
  osc.start(ac.currentTime + 0.001);
  osc.stop(ac.currentTime + 0.05);
}

// 泡泡音 — 柔和正弦波上滑
function playBubble(ac: AudioContext) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.connect(g); g.connect(ac.destination);
  const base = 400 + Math.random() * 400;
  osc.frequency.setValueAtTime(base, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(base * 2.5, ac.currentTime + 0.08);
  osc.type = "sine";
  g.gain.setValueAtTime(0.08, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.13);
}

// 哒哒声 — 短促三角波打击感（音量大幅提升）
function playClick(ac: AudioContext) {
  const t = ac.currentTime;
  // 第一下"哒"
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.connect(g); g.connect(ac.destination);
  osc.frequency.value = 1800 + Math.random() * 800;
  osc.type = "triangle";
  g.gain.setValueAtTime(0.18, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
  osc.start(t);
  osc.stop(t + 0.035);
  // 第二下"哒"——双重敲击
  const osc2 = ac.createOscillator();
  const g2 = ac.createGain();
  osc2.connect(g2); g2.connect(ac.destination);
  osc2.frequency.value = 2200 + Math.random() * 600;
  osc2.type = "triangle";
  g2.gain.setValueAtTime(0.12, t + 0.035);
  g2.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
  osc2.start(t + 0.035);
  osc2.stop(t + 0.07);
}

// 激光音 — 锯齿波快速下滑（音量大幅提升）
function playLaser(ac: AudioContext) {
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.connect(g); g.connect(ac.destination);
  osc.frequency.setValueAtTime(3000 + Math.random() * 1000, t);
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.1);
  osc.type = "sawtooth";
  g.gain.setValueAtTime(0.14, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  osc.start(t);
  osc.stop(t + 0.13);
}

// ===== BOOT =====
const BOOT = [
  "[SYS] 初始化终端系统...",
  "[SYS] 加载内核模块... OK",
  "[NET] 建立加密连接... OK",
  "[DB]  连接数据库... OK",
  "[SEC] 安全协议已激活",
  "[OK]  TERMINAL_TODO v2.0 就绪",
];

// ===== WRAPPER =====
export default function TerminalAppWrapper() {
  return (
    <ErrorBoundary>
      <TerminalApp />
    </ErrorBoundary>
  );
}

// ===== MAIN APP =====
function TerminalApp() {
  const [phase, setPhase] = useState<"boot" | "app">("boot");
  const [bootIdx, setBootIdx] = useState(0);

  const [tab, setTab] = useState<"todos" | "notes">("todos");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [privacy, setPrivacy] = useState(false);

  const [modal, setModal] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Task | Note | null>(null);
  const [fTitle, setFTitle] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fGroup, setFGroup] = useState("默认");
  const [fPri, setFPri] = useState(0);

  const [sortBy, setSortBy] = useState<"date" | "priority" | "name">("date");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState("");
  const [clock, setClock] = useState("--:--:--");
  const [refreshing, setRefreshing] = useState(false);
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null);
  const [soundStyle, setSoundStyle] = useState<SoundStyle>("mech");
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Boot ----------
  useEffect(() => {
    if (phase !== "boot") return;
    if (bootIdx < BOOT.length) {
      const t = setTimeout(() => setBootIdx(bootIdx + 1), 250);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase("app"), 400);
    return () => clearTimeout(t);
  }, [phase, bootIdx]);

  // ---------- Clock ----------
  useEffect(() => {
    if (phase !== "app") return;
    const tick = () => {
      try { setClock(new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })); } catch (_e) { /* */ }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [phase]);

  // ---------- Fetch ----------
  const doFetch = useCallback(async () => {
    try {
      const q = search ? "?search=" + encodeURIComponent(search) : "";
      const [tr, nr] = await Promise.all([fetch("/api/tasks" + q), fetch("/api/notes" + q)]);
      if (tr.ok) { const d = await tr.json(); if (Array.isArray(d)) setTasks(d); }
      if (nr.ok) { const d = await nr.json(); if (Array.isArray(d)) setNotes(d); }
    } catch (_e) { /* */ }
  }, [search]);

  useEffect(() => {
    if (phase !== "app") return;
    setLoading(true);
    doFetch().finally(() => setLoading(false));
  }, [phase, doFetch]);

  // ---------- Toast ----------
  const showToast = useCallback((msg: string) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToastMsg(msg);
    toastRef.current = setTimeout(() => setToastMsg(""), 2500);
  }, []);

  // ---------- Toggle ----------
  const toggleTask = useCallback((t: Task) => {
    playBeep();
    const next = !t.completed;
    setTasks((p) => p.map((x) => (x.id === t.id ? { ...x, completed: next } : x)));
    fetch("/api/tasks/" + t.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: next }) }).catch(() => {});
  }, []);

  // ---------- Delete ----------
  const deleteItem = useCallback((type: "task" | "note", id: number) => {
    if (type === "task") setTasks((p) => p.filter((x) => x.id !== id));
    else setNotes((p) => p.filter((x) => x.id !== id));
    fetch("/api/" + type + "s/" + id, { method: "DELETE" }).catch(() => {});
    showToast("已删除 [OK]");
    setCtxMenu(null);
  }, [showToast]);

  // ---------- Refresh ----------
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await doFetch();
    setRefreshing(false);
    showToast("数据同步完成 [OK]");
  }, [doFetch, showToast]);

  // ---------- Modal ----------
  const openAdd = useCallback(() => {
    setFTitle(""); setFDesc(""); setFGroup("默认"); setFPri(0); setEditTarget(null);
    setModal(tab === "todos" ? "addTask" : "addNote");
  }, [tab]);

  const openEdit = useCallback((item: Task | Note, type: "task" | "note") => {
    setEditTarget(item);
    setFTitle(item.title || "");
    setFDesc(type === "task" ? ((item as Task).description || "") : ((item as Note).content || ""));
    if (type === "task") { setFGroup((item as Task).groupName || "默认"); setFPri((item as Task).priority ?? 0); }
    setModal(type === "task" ? "editTask" : "editNote");
    setCtxMenu(null);
  }, []);

  const closeModal = useCallback(() => { setModal(null); setEditTarget(null); }, []);

  const submitForm = useCallback(async () => {
    if (!fTitle.trim()) return;
    const body: Record<string, unknown> = { title: fTitle.trim() };
    try {
      if (modal === "addTask") {
        body.description = fDesc.trim() || null;
        body.groupName = fGroup.trim() || "默认";
        body.priority = fPri;
        const r = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (r.ok) { const t = await r.json(); setTasks((p) => [t, ...p]); showToast("任务已创建 [OK]"); }
      } else if (modal === "editTask" && editTarget) {
        body.description = fDesc.trim() || null;
        body.groupName = fGroup.trim();
        body.priority = fPri;
        const r = await fetch("/api/tasks/" + (editTarget as Task).id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (r.ok) { const u = await r.json(); setTasks((p) => p.map((x) => (x.id === u.id ? u : x))); showToast("任务已更新 [OK]"); }
      } else if (modal === "addNote") {
        body.content = fDesc.trim() || null;
        const r = await fetch("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (r.ok) { const n = await r.json(); setNotes((p) => [n, ...p]); showToast("笔记已创建 [OK]"); }
      } else if (modal === "editNote" && editTarget) {
        body.content = fDesc.trim() || null;
        const r = await fetch("/api/notes/" + (editTarget as Note).id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (r.ok) { const u = await r.json(); setNotes((p) => p.map((x) => (x.id === u.id ? u : x))); showToast("笔记已更新 [OK]"); }
      }
    } catch (_e) { showToast("操作失败"); }
    closeModal();
  }, [modal, editTarget, fTitle, fDesc, fGroup, fPri, showToast, closeModal]);

  // ---------- Grouped ----------
  const grouped = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      if (sortBy === "priority") return (b.priority ?? 0) - (a.priority ?? 0);
      if (sortBy === "name") return (a.title ?? "").localeCompare(b.title ?? "");
      return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
    });
    const map = new Map<string, Task[]>();
    for (const t of sorted) {
      const g = t.groupName || "默认";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(t);
    }
    const result: { name: string; items: Task[]; total: number; done: number }[] = [];
    for (const [name, items] of map) {
      result.push({ name, items, total: items.length, done: items.filter((t) => t.completed).length });
    }
    return result;
  }, [tasks, sortBy]);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.completed).length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const isTaskModal = modal === "addTask" || modal === "editTask";

  const fmtTime = (s: string | null | undefined): string => {
    try {
      if (!s) return "";
      const d = new Date(s);
      if (isNaN(d.getTime())) return "";
      const diff = Date.now() - d.getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return "刚刚";
      if (m < 60) return m + "分钟前";
      const h = Math.floor(m / 60);
      if (h < 24) return h + "小时前";
      const dd = Math.floor(h / 24);
      if (dd < 7) return dd + "天前";
      return d.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
    } catch (_e) { return ""; }
  };

  // ---------- Right-click / long-press handler ----------
  const handleContextMenu = useCallback((e: React.MouseEvent | React.TouchEvent, type: "task" | "note", item: Task | Note) => {
    e.preventDefault();
    e.stopPropagation();
    let x = 0, y = 0;
    if ("clientX" in e) {
      x = e.clientX;
      y = e.clientY;
    } else if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    }
    // Ensure menu stays within viewport
    const menuW = 200, menuH = 220;
    if (x + menuW > (typeof window !== "undefined" ? window.innerWidth : 400)) x = x - menuW;
    if (y + menuH > (typeof window !== "undefined" ? window.innerHeight : 800)) y = y - menuH;
    setCtxMenu({ x, y, type, item });
  }, []);

  // Close context menu on any click outside
  useEffect(() => {
    if (!ctxMenu) return;
    const close = () => setCtxMenu(null);
    document.addEventListener("click", close);
    document.addEventListener("contextmenu", close);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("contextmenu", close);
    };
  }, [ctxMenu]);

  // ========================
  // RENDER: BOOT
  // ========================
  if (phase === "boot") {
    return (
      <div style={{ minHeight: "100dvh", background: "linear-gradient(160deg, #0a0a0a, #121218, #0e0e14, #14141c, #0a0a0a)", padding: 24, fontFamily: "monospace" }}>
        <pre style={{ color: "#00e5ff", fontSize: 10, lineHeight: 1.2, marginBottom: 20, whiteSpace: "pre" }}>
{`████████╗███████╗██████╗ ███╗   ███╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
   ██║   █████╗  ██████╔╝██╔████╔██║
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝`}
        </pre>
        <div style={{ color: "#00ff41", fontSize: 14, lineHeight: 2 }}>
          {BOOT.slice(0, bootIdx).map((line, i) => (
            <div key={i} className="fade-in" style={{
              color: line.indexOf("OK") >= 0 || line.indexOf("就绪") >= 0 ? "#00ff41" : line.indexOf("...") >= 0 ? "#ffff00" : "#c9d1d9",
            }}>
              {line}
            </div>
          ))}
          <span className="blink" style={{ color: "#00ff41" }}>&#9608;</span>
        </div>
      </div>
    );
  }

  // ========================
  // RENDER: MAIN APP
  // ========================
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      fontFamily: "monospace",
      /* 金属拉丝质感背景 */
      background: `
        repeating-linear-gradient(90deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.02) 1px, rgba(255,255,255,0.005) 2px, transparent 3px),
        linear-gradient(160deg, #0a0a0a 0%, #121218 15%, #0e0e14 30%, #14141c 45%, #0a0a10 55%, #101018 70%, #0c0c12 85%, #0a0a0a 100%)
      `,
    }}>
      {/* Scanlines */}
      <div className="scanlines" />

      {/* ===== STATUS BAR ===== */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        fontSize: 14,
        color: "#00ff41",
        background: "linear-gradient(180deg, rgba(0,255,65,0.05), transparent)",
        borderBottom: "1px solid #1a3a1a",
        userSelect: "none",
        zIndex: 50,
        flexShrink: 0,
      }}>
        <span style={{ textShadow: "0 0 6px rgba(0,255,65,0.4)" }}>&#9889; SIGNAL: OK</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: "#8b949e" }}>|</span>
          <span style={{ color: "#00e5ff", textShadow: "0 0 6px rgba(0,229,255,0.3)" }}>{clock}</span>
          <span style={{ color: "#8b949e" }}>|</span>
          <button onClick={() => setPrivacy(!privacy)} className="t-btn" style={{
            color: privacy ? "#ff0040" : "#00ff41",
            fontSize: 14,
            padding: "4px 10px",
            border: "1px solid " + (privacy ? "rgba(255,0,64,0.3)" : "rgba(0,255,65,0.3)"),
            borderRadius: 3,
            background: privacy ? "rgba(255,0,64,0.1)" : "rgba(0,255,65,0.1)",
          }}>
            {privacy ? "🔒 HIDDEN" : "🔓 PUBLIC"}
          </button>
          {/* 音效切换按钮 */}
          <button
            onClick={() => {
              const idx = SOUND_ORDER.indexOf(soundStyle);
              const next = SOUND_ORDER[(idx + 1) % SOUND_ORDER.length];
              setSoundStyle(next);
              setGlobalSoundStyle(next);
              playTypeSound();
            }}
            style={{
              fontFamily: "monospace",
              color: soundStyle === "off" ? "#484f58" : "#ffff00",
              fontSize: 12,
              padding: "4px 8px",
              border: "1px solid " + (soundStyle === "off" ? "#30363d" : "rgba(255,255,0,0.3)"),
              borderRadius: 3,
              background: soundStyle === "off" ? "rgba(72,79,88,0.1)" : "rgba(255,255,0,0.1)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {SOUND_LABELS[soundStyle]}
          </button>
        </div>
      </header>

      {/* ===== TITLE ===== */}
      <div style={{ padding: "16px 20px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: "#00ff41", margin: 0, textShadow: "0 0 10px rgba(0,255,65,0.5)" }}>
            {tab === "todos" ? "> 待办_" : "> 笔记_"}
          </h1>
          <span className="blink" style={{ color: "#00ff41", fontSize: 36 }}>&#9608;</span>
        </div>
        {tab === "todos" && totalTasks > 0 && (
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 16, fontSize: 16, color: "#8b949e" }}>
            <span style={{ color: "#00ff41" }}>[总计:{totalTasks}]</span>
            <span style={{ color: "#00e5ff" }}>[完成:{doneTasks}]</span>
            <span style={{ color: "#ffff00" }}>[进度:{progress}%]</span>
            <div style={{ flex: 1, height: 6, background: "#161b22", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg, #00ff41, #00cc33)", boxShadow: "0 0 10px #00ff41", width: progress + "%", transition: "width 0.5s" }} />
            </div>
          </div>
        )}
      </div>

      {/* ===== SEARCH ===== */}
      <div style={{ padding: "0 20px 10px", flexShrink: 0 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#00ff41", fontSize: 20, fontWeight: 700 }}>&gt;</span>
          <input
            type="text"
            placeholder="搜索..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); playTypeSound(); }}
            className="t-input"
            style={{ paddingLeft: 40, fontSize: 18 }}
          />
          {search ? (
            <button onClick={() => setSearch("")} className="t-btn" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#8b949e", fontSize: 20 }}>&#10005;</button>
          ) : null}
        </div>
      </div>

      {/* ===== SORT BAR ===== */}
      <div style={{ padding: "0 20px 10px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, flexShrink: 0 }}>
        <span style={{ color: "#8b949e" }}>排序:</span>
        {(["date", "priority", "name"] as const).map((v) => (
          <button key={v} onClick={() => setSortBy(v)} style={{
            padding: "4px 12px",
            border: "1px solid " + (sortBy === v ? "#00ff41" : "#1a3a1a"),
            background: sortBy === v ? "rgba(0,255,65,0.1)" : "transparent",
            color: sortBy === v ? "#00ff41" : "#8b949e",
            fontFamily: "monospace",
            fontSize: 14,
            cursor: "pointer",
            borderRadius: 3,
          }}>
            {v === "date" ? "日期" : v === "priority" ? "优先级" : "名称"}
          </button>
        ))}
        <button onClick={refresh} className={refreshing ? "spinning" : ""} style={{ marginLeft: "auto", background: "none", border: "none", color: "#8b949e", fontSize: 22, cursor: "pointer", display: "inline-block" }}>&#8635;</button>
      </div>

      {refreshing && (
        <div style={{ padding: "0 20px 10px", flexShrink: 0 }}>
          <div style={{ height: 3, background: "#161b22", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "#00ff41", animation: "scan 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      )}

      {/* ===== CONTENT AREA ===== */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "0 20px 120px",
        filter: privacy ? "blur(10px) grayscale(1)" : "none",
        opacity: privacy ? 0.4 : 1,
        pointerEvents: privacy ? "none" : "auto",
        transition: "all 0.3s",
      }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#00ff41", gap: 6, fontSize: 18 }}>
            <span>&#9679;</span><span>&#9679;</span><span>&#9679;</span>
            <span style={{ marginLeft: 16, color: "#8b949e" }}>加载数据中...</span>
          </div>
        ) : tab === "todos" ? (
          grouped.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#8b949e", fontSize: 18 }}>
              <div style={{ fontSize: 22, marginBottom: 12 }}>$ ls /tasks/</div>
              <div>空目录 - 暂无任务</div>
              <div className="blink" style={{ color: "#00ff41", marginTop: 20, fontSize: 18 }}>点击 + 创建新任务_</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {grouped.map((g) => (
                <div key={g.name} className="t-card metal-sheen">
                  {/* Group Header */}
                  <div
                    onClick={() => setCollapsed((p) => ({ ...p, [g.name]: !p[g.name] }))}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", cursor: "pointer", userSelect: "none", background: "rgba(0,255,65,0.03)" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: "#00ff41", fontSize: 14, display: "inline-block", transition: "transform 0.3s", transform: collapsed[g.name] ? "rotate(-90deg)" : "none" }}>&#9660;</span>
                      <span style={{ color: "#00ff41", fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>[{g.name}]</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 80, height: 6, background: "#161b22", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "linear-gradient(90deg, #00ff41, #00cc33)", width: (g.total > 0 ? (g.done / g.total) * 100 : 0) + "%", transition: "width 0.5s" }} />
                      </div>
                      <span style={{ fontSize: 14, color: "#8b949e" }}>{g.done}/{g.total}</span>
                    </div>
                  </div>

                  {/* Task Items */}
                  {!collapsed[g.name] && g.items.map((task) => (
                    <div
                      key={task.id}
                      className="task-row"
                      onContextMenu={(e) => handleContextMenu(e, "task", task)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                        padding: "14px 16px",
                        borderTop: "1px solid #1a3a1a",
                        opacity: task.completed ? 0.5 : 1,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task)}
                        style={{ marginTop: 4, accentColor: "#00ff41", width: 24, height: 24, cursor: "pointer", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: 18,
                          lineHeight: 1.5,
                          textDecoration: task.completed ? "line-through" : "none",
                          color: task.completed ? "#8b949e" : "#e6edf3",
                        }}>
                          {task.title || "(无标题)"}
                        </div>
                        {task.description ? (
                          <div style={{ fontSize: 14, color: "#8b949e", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.description}</div>
                        ) : null}
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "#8b949e" }}>{fmtTime(task.createdAt)}</span>
                          {(task.priority ?? 0) > 0 ? (
                            <span style={{ fontSize: 12, color: "#ff8800", background: "rgba(255,136,0,0.1)", padding: "2px 8px", borderRadius: 3, border: "1px solid rgba(255,136,0,0.2)" }}>P{task.priority}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        ) : notes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#8b949e", fontSize: 18 }}>
            <div style={{ fontSize: 22, marginBottom: 12 }}>$ ls /notes/</div>
            <div>空目录 - 暂无笔记</div>
            <div className="blink" style={{ color: "#00e5ff", marginTop: 20, fontSize: 18 }}>点击 + 创建新笔记_</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notes.map((note) => (
              <div
                key={note.id}
                className="t-card metal-sheen"
                onContextMenu={(e) => handleContextMenu(e, "note", note)}
                style={{ padding: 16 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#00e5ff", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{note.title || "(无标题)"}</div>
                </div>
                {note.content ? <div style={{ fontSize: 14, color: "#8b949e", marginTop: 8 }}>{note.content}</div> : null}
                <div style={{ fontSize: 12, color: "#8b949e", marginTop: 10 }}>{fmtTime(note.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== BOTTOM NAV ===== */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        zIndex: 50,
        background: "linear-gradient(180deg, rgba(20,20,28,0.95), rgba(14,14,20,0.98))",
        borderTop: "1px solid #1a3a1a",
        backdropFilter: "blur(10px)",
      }}>
        {(["todos", "notes"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className="t-nav-btn" style={{
            color: tab === t ? "#00ff41" : "#8b949e",
            fontSize: 16,
            transition: "color 0.2s",
          }}>
            <span style={{ display: "block", fontSize: 24, marginBottom: 4 }}>{t === "todos" ? "\u2611" : "\uD83D\uDCDD"}</span>
            {t === "todos" ? "待办" : "笔记"}
            {tab === t ? (
              <span style={{ position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)", width: 40, height: 3, background: "#00ff41", boxShadow: "0 0 10px #00ff41", borderRadius: 2 }} />
            ) : null}
          </button>
        ))}
      </nav>

      {/* ===== FAB (添加按钮) ===== */}
      <button onClick={openAdd} className="fab-btn pulse">
        +
      </button>

      {/* ===== RIGHT-CLICK CONTEXT MENU ===== */}
      {ctxMenu ? (
        <div
          className="ctx-menu"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: "8px 16px", fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: 2 }}>
            &#9654; 操作菜单
          </div>
          <div className="ctx-menu-sep" />
          {ctxMenu.type === "task" ? (
            <>
              <button className="ctx-menu-item" onClick={() => { toggleTask(ctxMenu.item as Task); setCtxMenu(null); }}>
                <span style={{ color: "#00ff41" }}>&#9745;</span>
                {(ctxMenu.item as Task).completed ? "标记未完成" : "标记已完成"}
              </button>
              <button className="ctx-menu-item" onClick={() => openEdit(ctxMenu.item, "task")}>
                <span style={{ color: "#00e5ff" }}>&#9998;</span>
                编辑任务
              </button>
              <div className="ctx-menu-sep" />
              <button className="ctx-menu-item danger" onClick={() => deleteItem("task", ctxMenu.item.id)}>
                <span>&#10005;</span>
                删除任务
              </button>
            </>
          ) : (
            <>
              <button className="ctx-menu-item" onClick={() => openEdit(ctxMenu.item, "note")}>
                <span style={{ color: "#00e5ff" }}>&#9998;</span>
                编辑笔记
              </button>
              <div className="ctx-menu-sep" />
              <button className="ctx-menu-item danger" onClick={() => deleteItem("note", ctxMenu.item.id)}>
                <span>&#10005;</span>
                删除笔记
              </button>
            </>
          )}
        </div>
      ) : null}

      {/* ===== MODAL ===== */}
      {modal ? (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          onWheel={(e) => e.stopPropagation()}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "flex-end" }}
        >
          <div
            className="slide-up"
            onWheel={(e) => { e.stopPropagation(); }}
            style={{
              width: "100%",
              background: "linear-gradient(160deg, #14141c 0%, #1a1a24 50%, #12121a 100%)",
              borderTop: "1px solid #2a4a2a",
              borderRadius: "16px 16px 0 0",
              padding: 24,
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ color: "#00ff41", fontSize: 32, fontWeight: 700, textShadow: "0 0 12px rgba(0,255,65,0.5)" }}>
                {isTaskModal ? (modal === "editTask" ? "> 编辑任务_" : "> 新建任务_") : (modal === "editNote" ? "> 编辑笔记_" : "> 新建笔记_")}
                <span className="blink" style={{ marginLeft: 4 }}>&#9608;</span>
              </div>
              <button onClick={closeModal} className="t-btn" style={{ color: "#8b949e", fontSize: 28, padding: 8 }}>&#10005;</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: 20, color: "#ff0040", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, textShadow: "0 0 8px rgba(255,0,64,0.3)" }}>{isTaskModal ? "任务标题" : "笔记标题"}</label>
                <input
                  autoFocus
                  type="text"
                  placeholder={isTaskModal ? "输入任务名称..." : "笔记标题..."}
                  value={fTitle}
                  onChange={(e) => { setFTitle(e.target.value); playTypeSound(); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitForm(); } }}
                  className="t-input"
                  style={{ marginTop: 6, fontSize: 18 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 20, color: "#ff0040", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, textShadow: "0 0 8px rgba(255,0,64,0.3)" }}>{isTaskModal ? "描述 (可选)" : "内容"}</label>
                <textarea
                  placeholder={isTaskModal ? "添加描述..." : "笔记内容..."}
                  value={fDesc}
                  onChange={(e) => { setFDesc(e.target.value); playTypeSound(); }}
                  rows={3}
                  className="t-input"
                  style={{ marginTop: 6, resize: "none", fontSize: 16 }}
                />
              </div>
              {isTaskModal ? (
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 20, color: "#ff0040", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, textShadow: "0 0 8px rgba(255,0,64,0.3)" }}>分组</label>
                    <input type="text" placeholder="分组名" value={fGroup} onChange={(e) => { setFGroup(e.target.value); playTypeSound(); }} className="t-input" style={{ marginTop: 6, fontSize: 16 }} />
                  </div>
                  <div style={{ width: 120 }}>
                    <label style={{ fontSize: 20, color: "#ff0040", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700, textShadow: "0 0 8px rgba(255,0,64,0.3)" }}>优先级</label>
                    <select value={fPri} onChange={(e) => { setFPri(parseInt(e.target.value) || 0); playTypeSound(); }} className="t-input" style={{ marginTop: 6, fontSize: 16, backgroundColor: "#0d1117", color: "#e6edf3" }}>
                      <option value="0" style={{ backgroundColor: "#0d1117", color: "#00ff41" }}>P0 低</option>
                      <option value="1" style={{ backgroundColor: "#0d1117", color: "#58a6ff" }}>P1 中</option>
                      <option value="2" style={{ backgroundColor: "#0d1117", color: "#ff8800" }}>P2 高</option>
                      <option value="3" style={{ backgroundColor: "#0d1117", color: "#ff0040" }}>P3 紧急</option>
                    </select>
                  </div>
                </div>
              ) : null}
              <button onClick={submitForm} style={{
                width: "100%",
                padding: "16px 0",
                background: isTaskModal ? "linear-gradient(135deg, #00ff41, #00cc33)" : "linear-gradient(135deg, #00e5ff, #0099cc)",
                color: "#0a0a0a",
                fontWeight: 700,
                fontSize: 18,
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "monospace",
                textShadow: "0 1px 0 rgba(255,255,255,0.2)",
              }}>
                {isTaskModal ? (modal === "editTask" ? "[ 更新任务 ]" : "[ 创建任务 ]") : (modal === "editNote" ? "[ 更新笔记 ]" : "[ 创建笔记 ]")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ===== PRIVACY OVERLAY ===== */}
      {privacy ? (
        <div
          onClick={() => setPrivacy(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 150,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="blink" style={{ color: "#ff0040", fontSize: 28, fontWeight: 700, textShadow: "0 0 12px #ff0040", marginBottom: 12 }}>
            [ 隐私模式已激活 ]
          </div>
          <div style={{ color: "#8b949e", fontSize: 16 }}>点击屏幕任何位置解除锁定</div>
        </div>
      ) : null}

      {/* ===== TOAST ===== */}
      {toastMsg ? (
        <div className="slide-up" style={{
          position: "fixed", bottom: 90, left: 20, right: 20, zIndex: 400,
          padding: "14px 20px", borderRadius: 6, fontSize: 16, textAlign: "center",
          background: "rgba(0,255,65,0.15)", color: "#00ff41", border: "1px solid rgba(0,255,65,0.3)",
          backdropFilter: "blur(10px)",
        }}>
          &gt; {toastMsg}
        </div>
      ) : null}
    </div>
  );
}
