#!/usr/bin/env node

/**
 * AgentPulse CLI - 1-Command Launcher
 * 
 * Usage:
 *   npx agentpulse              -> Launches Cockpit + Telemetry Server + Browser
 *   npx agentpulse --demo       -> Launches Cockpit + Telemetry Server + Mock Traffic + Browser
 *   npx agentpulse proxy -- <cmd> -> Wraps any MCP Server with the telemetry proxy
 */

import { spawn } from 'child_process';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const isDemo = args.includes('--demo') || args.length === 0;
const isProxy = args[0] === 'proxy';

console.log(`
\x1b[36m  ⚡ AgentPulse v0.1.0\x1b[0m
  The Real-Time Observability & Circuit-Breaker Cockpit for AI Agents & MCP Servers
`);

if (isProxy) {
  const targetCmd = args.slice(1);
  if (targetCmd.length === 0 || targetCmd[0] === '--') {
    targetCmd.shift();
  }
  
  if (targetCmd.length === 0) {
    console.error(`\x1b[31mError: Missing target MCP command.\x1b[0m`);
    console.log(`Usage: npx agentpulse proxy -- <mcp-server-command>`);
    console.log(`Example: npx agentpulse proxy -- npx -y @modelcontextprotocol/server-filesystem .`);
    process.exit(1);
  }

  const proxyScript = path.join(PROJECT_ROOT, 'src', 'server', 'mcp-interceptor.ts');
  const child = spawn('npx', ['tsx', proxyScript, ...targetCmd], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  child.on('exit', (code) => process.exit(code || 0));
} else {
  console.log(`\x1b[35m[1/3]\x1b[0m Starting Telemetry Gateway on port 4300...`);
  const server = spawn('npx', ['tsx', path.join(PROJECT_ROOT, 'src', 'server', 'telemetry-server.ts')], {
    stdio: 'inherit',
    shell: true,
    cwd: PROJECT_ROOT
  });

  console.log(`\x1b[34m[2/3]\x1b[0m Starting AgentPulse Cockpit UI on http://localhost:3000...`);
  const ui = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: PROJECT_ROOT
  });

  if (isDemo) {
    console.log(`\x1b[32m[3/3]\x1b[0m Spawning Simulated Agent Traffic generator...`);
    setTimeout(() => {
      spawn('npx', ['tsx', path.join(PROJECT_ROOT, 'src', 'server', 'mock-agent.ts')], {
        stdio: 'inherit',
        shell: true,
        cwd: PROJECT_ROOT
      });
    }, 2000);
  }

  // Open browser automatically once UI is ready
  function checkUiAndOpen() {
    const req = http.get('http://localhost:3000', () => {
      console.log(`\n\x1b[32m✔ Cockpit is live!\x1b[0m Opening http://localhost:3000 in your browser...\n`);
      const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      spawn(startCmd, ['http://localhost:3000'], { shell: true });
    });
    req.on('error', () => {
      setTimeout(checkUiAndOpen, 1000);
    });
  }

  setTimeout(checkUiAndOpen, 1500);

  const cleanup = () => {
    server.kill();
    ui.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

