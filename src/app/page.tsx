"use client";

import dynamic from "next/dynamic";

const TerminalApp = dynamic(() => import("@/components/TerminalApp"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "100dvh",
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        color: "#00ff41",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 2 }}>
        TERMINAL_TODO v2.0
      </div>
      <div style={{ fontSize: 10, color: "#484f58" }}>
        正在初始化系统...
      </div>
    </div>
  ),
});

export default function Page() {
  return <TerminalApp />;
}
