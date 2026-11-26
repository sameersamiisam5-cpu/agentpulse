import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://agentpulse-three.vercel.app"),
  title: "AgentPulse — Real-Time AI Agent & MCP Telemetry Cockpit",
  description:
    "Real-time observability, live latency waterfalls, recursive loop circuit-breakers, and token tracking for autonomous AI agents (Claude Code, Cursor) and Model Context Protocol (MCP) servers.",
  keywords: [
    "AI Agent Observability",
    "Model Context Protocol",
    "MCP Telemetry",
    "Claude Code telemetry",
    "Cursor AI monitoring",
    "WebSocket latency waterfall",
    "Full-Stack AI Developer",
    "Sameer Khan",
  ],
  authors: [{ name: "Sameer Khan", url: "https://github.com/sameersamiisam5-cpu" }],
  creator: "Sameer Khan",
  openGraph: {
    title: "AgentPulse — Real-Time AI Agent & MCP Observability Cockpit",
    description:
      "Intercept agent execution, inspect tool payload diffs, and halt recursive loops in real time.",
    url: "https://agentpulse-three.vercel.app",
    siteName: "AgentPulse",
    images: [
      {
        url: "/agentpulse-preview.png",
        width: 1200,
        height: 630,
        alt: "AgentPulse AI Agent Telemetry Cockpit",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentPulse — Real-Time AI Agent & MCP Telemetry Cockpit",
    description:
      "Real-time observability and circuit-breaker platform for autonomous AI agents and MCP servers.",
    images: ["/agentpulse-preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#08090d] text-zinc-100">
        {children}
      </body>
    </html>
  );
}
