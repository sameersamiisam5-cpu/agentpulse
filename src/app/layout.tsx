import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentPulse — MCP & AI Agent Telemetry Cockpit",
  description: "Real-time observability, live waterfall timeline, loop detection, and token tracking for AI agents and Model Context Protocol servers.",
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
